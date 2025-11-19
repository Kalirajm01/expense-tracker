from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models import Category, Expense, User, UserSession
from datetime import datetime, timedelta, timezone
import hashlib

# IST is UTC+5:30
IST_OFFSET = timedelta(hours=5, minutes=30)

def get_ist_now():
    """Get current time in IST timezone"""
    return datetime.now(timezone.utc) + IST_OFFSET

category_routes = Blueprint('category_routes', __name__)

@category_routes.route('', methods=['GET'])
@jwt_required()
def get_categories():
    user_id = get_jwt_identity()
    categories = Category.query.filter_by(user_id=user_id).all()
    return jsonify([category.to_dict() for category in categories])

@category_routes.route('/<int:category_id>', methods=['GET'])
@jwt_required()
def get_category(category_id):
    user_id = get_jwt_identity()
    category = Category.query.filter_by(id=category_id, user_id=user_id).first_or_404()
    return jsonify(category.to_dict())

@category_routes.route('', methods=['POST'])
@jwt_required()
def create_category():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('name') or not data['name'].strip():
        return jsonify({"error": "Category name cannot be empty or contain only spaces"}), 400

    # Remove leading/trailing spaces and check for duplicates (case-insensitive) for this user
    name = data['name'].strip()
    existing_category = Category.query.filter(Category.name.ilike(name), Category.user_id == user_id).first()
    if existing_category:
        return jsonify({"error": f"A category with the name '{name}' already exists (case-insensitive match with '{existing_category.name}')"}), 400

    try:
        category = Category(
            name=data['name'],
            description=data.get('description', ''),
            user_id=user_id
        )

        db.session.add(category)
        db.session.commit()

        return jsonify(category.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@category_routes.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    user_id = get_jwt_identity()
    category = Category.query.filter_by(id=category_id, user_id=user_id).first_or_404()
    data = request.get_json()

    if 'name' in data and data['name'].strip().lower() != category.name.lower():
        name = data['name'].strip()
        existing_category = Category.query.filter(
            Category.id != category_id,
            Category.name.ilike(name),
            Category.user_id == user_id
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
@jwt_required()
def delete_category(category_id):
    user_id = get_jwt_identity()
    category = Category.query.filter_by(id=category_id, user_id=user_id).first_or_404()

    if request.method == 'GET':
        # Check if category has associated expenses for this user
        has_expenses = Expense.query.filter_by(category_id=category_id, user_id=user_id).first() is not None
        return jsonify({"has_expenses": has_expenses})

    elif request.method == 'DELETE':
        # Check if category has associated expenses for this user
        has_expenses = Expense.query.filter_by(category_id=category_id, user_id=user_id).first() is not None
        if has_expenses:
            return jsonify({"error": "Cannot delete category with associated expenses"}), 400

        db.session.delete(category)
        db.session.commit()
        return jsonify({"message": "Category deleted successfully"}), 200

expense_routes = Blueprint('expense_routes', __name__)

@expense_routes.route('', methods=['GET'])
@jwt_required()
def get_expenses():
    user_id = get_jwt_identity()
    expenses = Expense.query.filter_by(user_id=user_id).all()
    return jsonify([expense.to_dict() for expense in expenses])

@expense_routes.route('/<int:expense_id>', methods=['GET'])
@jwt_required()
def get_expense(expense_id):
    user_id = get_jwt_identity()
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first_or_404()
    return jsonify(expense.to_dict())

@expense_routes.route('', methods=['POST'])
@jwt_required()
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
        expense_date = get_ist_now().date()
    
    print(f"Processing expense for date: {expense_date}")
    
    # Check for duplicate expense if force_create is not set
    force_create = data.get('force_create', False)
    print(f"Force create flag: {force_create}, type: {type(force_create)}")
    
    if not force_create:
        user_id = get_jwt_identity()
        # Round the input amount to 2 decimal places for comparison
        input_amount = round(float(data['amount']), 2)

        # Get all expenses for the same date and category for this user
        potential_duplicates = Expense.query.filter(
            Expense.date == expense_date,
            Expense.category_id == int(data['category_id']),
            Expense.description == data.get('description', ''),
            Expense.user_id == user_id
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
    
    user_id = get_jwt_identity()
    try:
        expense = Expense(
            amount=float(data['amount']),
            description=data.get('description', ''),
            date=expense_date or get_ist_now().date(),
            category_id=int(data['category_id']),
            user_id=user_id
        )
        print("Created expense object:", expense.to_dict())
    except Exception as e:
        print(f"Error creating expense: {str(e)}")
        return jsonify({"error": "Failed to create expense"}), 500
    
    db.session.add(expense)
    db.session.commit()
    
    return jsonify(expense.to_dict()), 201

@expense_routes.route('/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    user_id = get_jwt_identity()
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first_or_404()
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
@jwt_required()
def delete_expense(expense_id):
    user_id = get_jwt_identity()
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first_or_404()
    db.session.delete(expense)
    db.session.commit()
    return jsonify({"message": "Expense deleted successfully"}), 200

@expense_routes.route('/summary', methods=['GET'])
@jwt_required()
def get_expense_summary():
    user_id = get_jwt_identity()
    try:
        total_expenses = db.session.query(db.func.sum(Expense.amount)).filter(Expense.user_id == user_id).scalar() or 0

        top_categories = db.session.query(
            Category.name,
            db.func.sum(Expense.amount).label('total')
        ).join(Expense).filter(Expense.user_id == user_id).group_by(Category.name).order_by(db.desc('total')).limit(2).all()

        six_months_ago = get_ist_now() - timedelta(days=180)
        monthly_expenses = db.session.query(
            db.func.to_char(Expense.date, 'YYYY-MM').label('month'),
            db.func.sum(Expense.amount).label('total')
        ).filter(Expense.date >= six_months_ago, Expense.user_id == user_id).group_by('month').order_by('month').all()

        return jsonify({
            'totalExpenses': float(total_expenses),
            'topCategories': [{'name': name, 'total': float(total)} for name, total in top_categories],
            'monthlyData': [{'month': month, 'total': float(total)} for month, total in monthly_expenses]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

auth_routes = Blueprint('auth_routes', __name__)

@auth_routes.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Username, email, and password are required"}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400

    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])

    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User created successfully", "user": user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@auth_routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get('username') or not data.get('password'):
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Invalid username or password"}), 401

    access_token = create_access_token(identity=user.id)

    # Hash the token and store in database
    token_hash = hashlib.sha256(access_token.encode()).hexdigest()

    # Create user session
    user_session = UserSession(
        user_id=user.id,
        token_hash=token_hash,
        status='active'
    )

    try:
        db.session.add(user_session)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to create session"}), 500

    return jsonify({
        "token": access_token,
        "user": user.to_dict()
    }), 200

@auth_routes.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # Get the token from the Authorization header
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({"error": "Invalid authorization header"}), 400

    token = auth_header.replace('Bearer ', '')

    # Hash the token
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    # Find and expire the session
    session = UserSession.query.filter_by(token_hash=token_hash, status='active').first()
    if session:
        session.status = 'expired'
        db.session.commit()

    return jsonify({"message": "Successfully logged out"}), 200

@auth_routes.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200
