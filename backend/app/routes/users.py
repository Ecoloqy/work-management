from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import User
from app import db
from app.routes.auth import validate_password

users = Blueprint('users', __name__, url_prefix='/api/users')

@users.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Użytkownik nie został znaleziony'}), 404
    
    return jsonify({
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name
    })

@users.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Użytkownik nie został znaleziony'}), 404
    
    data = request.get_json()
    
    # Sprawdź czy email nie jest już zajęty przez innego użytkownika
    if 'email' in data and data['email'] != user.email:
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'Email jest już zajęty'}), 400
    
    # Aktualizuj dane użytkownika
    if 'email' in data:
        user.email = data['email']
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Profil został zaktualizowany',
            'user': {
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Nie udało się zaktualizować profilu'}), 500

@users.route('/profile/password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Użytkownik nie został znaleziony'}), 404
    
    data = request.get_json()
    
    if not all(k in data for k in ('current_password', 'new_password')):
        return jsonify({'error': 'Brakujące dane'}), 400
    
    # Sprawdź obecne hasło
    if not check_password_hash(user.password_hash, data['current_password']):
        return jsonify({'error': 'Nieprawidłowe obecne hasło'}), 400
    
    # Walidacja nowego hasła
    is_valid, error_message = validate_password(data['new_password'])
    if not is_valid:
        return jsonify({'error': error_message}), 400
    
    # Zaktualizuj hasło
    user.password_hash = generate_password_hash(data['new_password'])
    
    try:
        db.session.commit()
        return jsonify({'message': 'Hasło zostało zmienione'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Nie udało się zmienić hasła'}), 500 