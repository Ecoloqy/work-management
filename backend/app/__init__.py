from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='development'):
    app = Flask(__name__)
    
    # Load config based on environment
    from app.config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configure CORS based on environment
    if config_name == 'production':
        CORS(app, resources={r"/api/*": {"origins": "*"}})
    else:
        CORS(app)
    
    with app.app_context():
        # Import models to ensure they are registered with SQLAlchemy
        from . import models
        
        # Create tables if they don't exist (useful for development)
        if config_name == 'development':
            db.create_all()
        
        # Register blueprints
        from app.routes import auth_bp, employee_bp, workplace_bp, users
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(employee_bp, url_prefix='/api/employees')
        app.register_blueprint(workplace_bp, url_prefix='/api/workplaces')
        app.register_blueprint(users)
    
    return app 