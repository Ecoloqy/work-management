from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os
from config import Config

# Load environment variables from .env file
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    
    # Load config based on environment
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configure CORS based on environment
    if config_class.PRODUCTION:
        CORS(app, resources={r"/api/*": {"origins": "*"}})
    else:
        CORS(app)
    
    with app.app_context():
        # Import models to ensure they are registered with SQLAlchemy
        from . import models
        
        # Create tables if they don't exist (useful for development)
        if config_class.DEVELOPMENT:
            db.create_all()
        
        # Register blueprints
        from .routes.auth import auth_bp
        from .routes.users import users_bp
        from .routes.employees import employees_bp
        from .routes.workplaces import workplaces_bp
        from .routes.costs import costs_bp
        from .routes.revenues import revenues_bp
        from .routes.schedules import schedules_bp
        from .routes.reports import reports_bp
        
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(users_bp, url_prefix='/api/users')
        app.register_blueprint(employees_bp, url_prefix='/api/employees')
        app.register_blueprint(workplaces_bp, url_prefix='/api/workplaces')
        app.register_blueprint(costs_bp, url_prefix='/api/costs')
        app.register_blueprint(revenues_bp, url_prefix='/api/revenues')
        app.register_blueprint(schedules_bp, url_prefix='/api/schedules')
        app.register_blueprint(reports_bp, url_prefix='/api/reports')
    
    return app 