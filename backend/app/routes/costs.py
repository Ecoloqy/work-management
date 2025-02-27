from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import func
from .. import db
from ..models import WorkplaceCost, EmployeeCost, Workplace, Employee

costs_bp = Blueprint('costs', __name__)

@costs_bp.route('', methods=['GET'])
@jwt_required()
def get_costs():
    user_id = get_jwt_identity()
    
    # Pobierz koszty miejsc pracy użytkownika
    workplace_costs = db.session.query(WorkplaceCost).join(
        Workplace, WorkplaceCost.workplace_id == Workplace.id
    ).filter(
        Workplace.owner_id == user_id
    ).all()
    
    # Pobierz koszty pracowników użytkownika
    employee_costs = db.session.query(EmployeeCost).join(
        Employee, EmployeeCost.employee_id == Employee.id
    ).filter(
        Employee.user_id == user_id
    ).all()
    
    # Przygotuj dane do odpowiedzi
    costs = []
    
    # Dodaj koszty miejsc pracy
    for cost in workplace_costs:
        costs.append({
            'id': cost.id,
            'type': 'workplace',
            'workplace_id': cost.workplace_id,
            'workplace_name': cost.workplace.name,
            'description': cost.description,
            'amount': float(cost.amount),
            'date': cost.date.isoformat(),
            'created_at': cost.created_at.isoformat()
        })
    
    # Dodaj koszty pracowników
    for cost in employee_costs:
        costs.append({
            'id': cost.id,
            'type': 'employee',
            'employee_id': cost.employee_id,
            'employee_name': f"{cost.employee.first_name} {cost.employee.last_name}",
            'description': cost.description,
            'amount': float(cost.amount),
            'date': cost.date.isoformat(),
            'created_at': cost.created_at.isoformat()
        })
    
    # Sortuj koszty po dacie (najnowsze pierwsze)
    costs.sort(key=lambda x: x['date'], reverse=True)
    
    return jsonify(costs)

@costs_bp.route('', methods=['POST'])
@jwt_required()
def create_cost():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    cost_type = data.get('type')
    if cost_type not in ['workplace', 'employee']:
        return jsonify({'error': 'Nieprawidłowy typ kosztu'}), 400
    
    try:
        if cost_type == 'workplace':
            # Sprawdź czy miejsce pracy należy do użytkownika
            workplace = Workplace.query.filter_by(
                id=data['workplace_id'], 
                owner_id=user_id
            ).first_or_404()
            
            cost = WorkplaceCost(
                workplace_id=data['workplace_id'],
                description=data['description'],
                amount=data['amount'],
                date=datetime.fromisoformat(data['date'])
            )
        else:
            # Sprawdź czy pracownik należy do użytkownika
            employee = Employee.query.filter_by(
                id=data['employee_id'], 
                user_id=user_id
            ).first_or_404()
            
            cost = EmployeeCost(
                employee_id=data['employee_id'],
                description=data['description'],
                amount=data['amount'],
                date=datetime.fromisoformat(data['date'])
            )
        
        db.session.add(cost)
        db.session.commit()
        
        return jsonify({
            'id': cost.id,
            'type': cost_type,
            'description': cost.description,
            'amount': float(cost.amount),
            'date': cost.date.isoformat(),
            'created_at': cost.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@costs_bp.route('/<string:type>/<uuid:id>', methods=['PUT'])
@jwt_required()
def update_cost(type, id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        if type == 'workplace':
            cost = WorkplaceCost.query.join(
                Workplace, WorkplaceCost.workplace_id == Workplace.id
            ).filter(
                WorkplaceCost.id == id,
                Workplace.owner_id == user_id
            ).first_or_404()
            
        elif type == 'employee':
            cost = EmployeeCost.query.join(
                Employee, EmployeeCost.employee_id == Employee.id
            ).filter(
                EmployeeCost.id == id,
                Employee.user_id == user_id
            ).first_or_404()
        else:
            return jsonify({'error': 'Nieprawidłowy typ kosztu'}), 400
        
        if 'description' in data:
            cost.description = data['description']
        if 'amount' in data:
            cost.amount = data['amount']
        if 'date' in data:
            cost.date = datetime.fromisoformat(data['date'])
        
        db.session.commit()
        
        return jsonify({
            'id': cost.id,
            'type': type,
            'description': cost.description,
            'amount': float(cost.amount),
            'date': cost.date.isoformat(),
            'updated_at': cost.updated_at.isoformat()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@costs_bp.route('/<string:type>/<uuid:id>', methods=['DELETE'])
@jwt_required()
def delete_cost(type, id):
    user_id = get_jwt_identity()
    
    try:
        if type == 'workplace':
            cost = WorkplaceCost.query.join(
                Workplace, WorkplaceCost.workplace_id == Workplace.id
            ).filter(
                WorkplaceCost.id == id,
                Workplace.owner_id == user_id
            ).first_or_404()
        elif type == 'employee':
            cost = EmployeeCost.query.join(
                Employee, EmployeeCost.employee_id == Employee.id
            ).filter(
                EmployeeCost.id == id,
                Employee.user_id == user_id
            ).first_or_404()
        else:
            return jsonify({'error': 'Nieprawidłowy typ kosztu'}), 400
        
        db.session.delete(cost)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 