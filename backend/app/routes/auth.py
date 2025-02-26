from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from .. import db
from ..models import User
import re

def validate_password(password):
    if len(password) < 8:
        return False, "Hasło musi mieć co najmniej 8 znaków"
    if not re.search(r"[a-z]", password):
        return False, "Hasło musi zawierać przynajmniej jedną małą literę"
    if not re.search(r"[A-Z]", password):
        return False, "Hasło musi zawierać przynajmniej jedną wielką literę"
    if not re.search(r"\d", password):
        return False, "Hasło musi zawierać przynajmniej jedną cyfrę"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Hasło musi zawierać przynajmniej jeden znak specjalny"
    return True, ""

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Walidacja hasła
    is_valid, error_message = validate_password(data['password'])
    if not is_valid:
        return jsonify({'error': error_message}), 400
        
    user = User(
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        role='user'
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Niepoprawny email lub hasło'}), 401
        
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role
        }
    })

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    return jsonify({
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role
    })
