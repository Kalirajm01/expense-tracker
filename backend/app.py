from flask import Flask, jsonify, request
from flask_migrate import Migrate
from flask_cors import CORS
import os
from dotenv import load_dotenv
from extensions import db

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
CORS(app)

# Import and register blueprints after db initialization to avoid circular imports
from routes import category_routes, expense_routes
app.register_blueprint(category_routes, url_prefix='/api/categories')
app.register_blueprint(expense_routes, url_prefix='/api/expenses')

@app.route('/')
def index():
    return jsonify({"message": "Welcome to Expense Tracker API"})

if __name__ == '__main__':
    app.run(debug=True)
