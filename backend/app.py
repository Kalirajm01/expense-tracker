from flask import Flask, jsonify, request
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, get_jwt
import os
import hashlib
from dotenv import load_dotenv
from extensions import db
from models import UserSession

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', app.config['SECRET_KEY'])

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app)

# Custom token validation
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    # Extract token from header
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return True

    token = auth_header.replace('Bearer ', '')

    # Hash the token for database lookup
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    # Check if token exists and is active
    session = db.session.query(UserSession).filter_by(
        token_hash=token_hash,
        status='active'
    ).first()

    # Return True if token is NOT valid (revoked/blocked)
    return session is None

# Import and register blueprints after db initialization to avoid circular imports
from routes import category_routes, expense_routes, auth_routes
app.register_blueprint(category_routes, url_prefix='/api/categories')
app.register_blueprint(expense_routes, url_prefix='/api/expenses')
app.register_blueprint(auth_routes, url_prefix='/api/auth')

@app.route('/')
def index():
    return jsonify({"message": "Welcome to Expense Tracker API"})

if __name__ == '__main__':
    app.run(debug=True)
