from flask import Blueprint, request, jsonify
from extensions import db
from models import Category, Expense
from datetime import datetime, timedelta

category_routes = Blueprint('category_routes', __name__)

@category_routes.route('', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([category.to_dict() for category in categories])

@category_routes.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    category = Category.query.get_or_404(category_id)
    return jsonify(category.to_dict())

@category_routes.route('', methods=['POST'])
def create_category():
    data = request.get_json()
    
    if not data.get('name') or not data['name'].strip():
        return jsonify({"error": "Category name cannot be empty or contain only spaces"}), 400
    
    # Remove leading/trailing spaces and check for duplicates (case-insensitive)
    name = data['name'].strip()
    existing_category = Category.query.filter(Category.name.ilike(name)).first()
    if existing_category:
        return jsonify({"error": f"A category with the name '{name}' already exists (case-insensitive match with '{existing_category.name}')"}), 400
        
    try:
        category = Category(
            name=data['name'],
            description=data.get('description', '')
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify(category.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@category_routes.route('/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    category = Category.query.get_or_404(category_id)
    data = request.get_json()
    
    if 'name' in data and data['name'].strip().lower() != category.name.lower():
        name = data['name'].strip()
        existing_category = Category.query.filter(
            Category.id != category_id,
            Category.name.ilike(name)
        ).first()
        if existing_category:
            return jsonify({"error": f"A category with the name '{name}' already exists (case-insensitive match with '{existing_category.name}')"}), 400
        category.name = name
        
    if 'description' in data:
        category.description = data['description']
    
    try:
        db.session.commit()
        return jsonify(category.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@category_routes.route('/<int:category_id>', methods=['GET', 'DELETE'])
def delete_category(category_id):
    category = Category.query.get_or_404(category_id)
    
    if request.method == 'GET':
        # Check if category has associated expenses
        has_expenses = Expense.query.filter_by(category_id=category_id).first() is not None
        return jsonify({"has_expenses": has_expenses})
        
    elif request.method == 'DELETE':
        # Check if category has associated expenses
        has_expenses = Expense.query.filter_by(category_id=category_id).first() is not None
        if has_expenses:
            return jsonify({"error": "Cannot delete category with associated expenses"}), 400
            
        db.session.delete(category)
        db.session.commit()
        return jsonify({"message": "Category deleted successfully"}), 200

expense_routes = Blueprint('expense_routes', __name__)

@expense_routes.route('', methods=['GET'])
def get_expenses():
    expenses = Expense.query.all()
    return jsonify([expense.to_dict() for expense in expenses])

@expense_routes.route('/<int:expense_id>', methods=['GET'])
def get_expense(expense_id):
    expense = Expense.query.get_or_404(expense_id)
    return jsonify(expense.to_dict())

@expense_routes.route('', methods=['POST'])
def create_expense():
    data = request.get_json()
    print("\n=== New Expense Request ===")
    print(f"Received data: {data}")
    print(f"Description type: {type(data.get('description'))}")
    print(f"Raw description: {data.get('description')}")
    print(f"Description length: {len(data.get('description', ''))}")
    
    required_fields = ['amount', 'category_id']
    if not all(field in data for field in required_fields):
        print("Missing required fields")
        return jsonify({"error": "Amount and category_id are required"}), 400
    
    try:
        expense_date = datetime.strptime(data.get('date'), '%Y-%m-%d').date() if 'date' in data else None
    except ValueError:
        print("Invalid date format")
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    # Set default date if not provided
    if not expense_date:
        expense_date = datetime.utcnow().date()
    
    print(f"Processing expense for date: {expense_date}")
    
    # Check for duplicate expense if force_create is not set
    force_create = data.get('force_create', False)
    print(f"Force create flag: {force_create}, type: {type(force_create)}")
    
    if not force_create:
        # Round the input amount to 2 decimal places for comparison
        input_amount = round(float(data['amount']), 2)
        
        # Get all expenses for the same date and category
        potential_duplicates = Expense.query.filter(
            Expense.date == expense_date,
            Expense.category_id == int(data['category_id']),
            Expense.description == data.get('description', '')
        ).all()
        
        # Check if any existing expense has the same amount when rounded to 2 decimal places
        existing_expense = None
        for expense in potential_duplicates:
            if round(expense.amount, 2) == input_amount:
                existing_expense = expense
                break
        
        if existing_expense:
            print(f"Found duplicate expense: {existing_expense.to_dict()}")
            response = {
                "error": "A similar expense already exists",
                "is_duplicate": True,
                "existing_expense": existing_expense.to_dict()
            }
            print(f"Sending response: {response}")
            return jsonify(response), 409  # 409 Conflict
    
    try:
        expense = Expense(
            amount=float(data['amount']),
            description=data.get('description', ''),
            date=expense_date or datetime.utcnow().date(),
            category_id=int(data['category_id'])
        )
        print("Created expense object:", expense.to_dict())
    except Exception as e:
        print(f"Error creating expense: {str(e)}")
        return jsonify({"error": "Failed to create expense"}), 500
    
    db.session.add(expense)
    db.session.commit()
    
    return jsonify(expense.to_dict()), 201

@expense_routes.route('/<int:expense_id>', methods=['PUT'])
def update_expense(expense_id):
    expense = Expense.query.get_or_404(expense_id)
    data = request.get_json()
    
    if 'amount' in data:
        expense.amount = float(data['amount'])
    if 'description' in data:
        expense.description = data['description']
    if 'date' in data:
        try:
            expense.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    if 'category_id' in data:
        expense.category_id = int(data['category_id'])
    
    db.session.commit()
    return jsonify(expense.to_dict())

@expense_routes.route('/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    expense = Expense.query.get_or_404(expense_id)
    db.session.delete(expense)
    db.session.commit()
    return jsonify({"message": "Expense deleted successfully"}), 200

@expense_routes.route('/summary', methods=['GET'])
def get_expense_summary():
    try:
        total_expenses = db.session.query(db.func.sum(Expense.amount)).scalar() or 0
        
        top_categories = db.session.query(
            Category.name,
            db.func.sum(Expense.amount).label('total')
        ).join(Expense).group_by(Category.name).order_by(db.desc('total')).limit(2).all()
        
        six_months_ago = datetime.now() - timedelta(days=180)
        monthly_expenses = db.session.query(
            db.func.to_char(Expense.date, 'YYYY-MM').label('month'),
            db.func.sum(Expense.amount).label('total')
        ).filter(Expense.date >= six_months_ago).group_by('month').order_by('month').all()
        
        return jsonify({
            'totalExpenses': float(total_expenses),
            'topCategories': [{'name': name, 'total': float(total)} for name, total in top_categories],
            'monthlyData': [{'month': month, 'total': float(total)} for month, total in monthly_expenses]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
