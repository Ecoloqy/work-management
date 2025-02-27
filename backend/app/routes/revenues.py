from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import func
from .. import db
from ..models import WorkplaceRevenue, Workplace, Employee, WorkplaceAssignment

revenues_bp = Blueprint('revenues', __name__)

@revenues_bp.route('', methods=['GET'])
@jwt_required()
def get_revenues():
    user_id = get_jwt_identity()
    
    # Pobierz przychody z miejsc pracy użytkownika lub przypisane do pracowników użytkownika
    revenues = db.session.query(WorkplaceRevenue).outerjoin(
        Workplace, WorkplaceRevenue.workplace_id == Workplace.id
    ).join(
        Employee, WorkplaceRevenue.employee_id == Employee.id, isouter=True
    ).filter(
        db.or_(
            Workplace.owner_id == user_id,
            Employee.user_id == user_id
        )
    ).all()
    
    # Przygotuj dane do odpowiedzi
    result = []
    for revenue in revenues:
        workplace_name = revenue.workplace.name if revenue.workplace else None
        employee_name = f"{revenue.employee.first_name} {revenue.employee.last_name}" if revenue.employee else None
        
        result.append({
            'id': revenue.id,
            'workplace_id': revenue.workplace_id,
            'workplace_name': workplace_name,
            'employee_id': revenue.employee_id,
            'employee_name': employee_name,
            'description': revenue.description,
            'amount': float(revenue.amount),
            'date': revenue.date.isoformat(),
            'created_at': revenue.created_at.isoformat()
        })
    
    # Sortuj przychody po dacie (najnowsze pierwsze)
    result.sort(key=lambda x: x['date'], reverse=True)
    
    return jsonify(result)

@revenues_bp.route('', methods=['POST'])
@jwt_required()
def create_revenue():
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        # Sprawdź typ przychodu
        revenue_type = data.get('type')
        if revenue_type not in ['workplace', 'employee']:
            return jsonify({'error': 'Nieprawidłowy typ przychodu'}), 400

        workplace = None
        employee = None

        if revenue_type == 'workplace':
            # Dla typu workplace, workplace_id jest wymagane
            if not data.get('workplace_id'):
                return jsonify({'error': 'Dla typu workplace, workplace_id jest wymagane'}), 400
                
            workplace = Workplace.query.filter_by(
                id=data['workplace_id'], 
                owner_id=user_id
            ).first_or_404()
            
            revenue = WorkplaceRevenue(
                workplace_id=workplace.id,
                employee_id=None,
                description=data['description'],
                amount=data['amount'],
                date=datetime.fromisoformat(data['date'])
            )

        elif revenue_type == 'employee':
            # Dla typu employee, employee_id jest wymagane
            if not data.get('employee_id'):
                return jsonify({'error': 'Dla typu employee, employee_id jest wymagane'}), 400
                
            employee = Employee.query.filter_by(
                id=data['employee_id'],
                user_id=user_id
            ).first_or_404()
            
            # Jeśli podano workplace_id, sprawdź czy należy do użytkownika
            if data.get('workplace_id'):
                workplace = Workplace.query.filter_by(
                    id=data['workplace_id'],
                    owner_id=user_id
                ).first_or_404()
                workplace_id = workplace.id
            else:
                workplace_id = None
            
            revenue = WorkplaceRevenue(
                workplace_id=workplace_id,
                employee_id=employee.id,
                description=data['description'],
                amount=data['amount'],
                date=datetime.fromisoformat(data['date'])
            )
        
        db.session.add(revenue)
        db.session.commit()
        
        return jsonify({
            'id': revenue.id,
            'workplace_id': revenue.workplace_id,
            'workplace_name': workplace.name if workplace else None,
            'employee_id': revenue.employee_id,
            'employee_name': f"{employee.first_name} {employee.last_name}" if employee else None,
            'description': revenue.description,
            'amount': float(revenue.amount),
            'date': revenue.date.isoformat(),
            'created_at': revenue.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@revenues_bp.route('/<uuid:id>', methods=['PUT'])
@jwt_required()
def update_revenue(id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        revenue = WorkplaceRevenue.query.join(
            Workplace, WorkplaceRevenue.workplace_id == Workplace.id
        ).filter(
            WorkplaceRevenue.id == id,
            Workplace.owner_id == user_id
        ).first_or_404()

        # Sprawdź typ przychodu
        revenue_type = data.get('type')
        if revenue_type not in ['workplace', 'employee']:
            return jsonify({'error': 'Nieprawidłowy typ przychodu'}), 400

        workplace = None
        employee = None

        if revenue_type == 'workplace':
            # Dla typu workplace, workplace_id jest wymagane
            if not data.get('workplace_id'):
                return jsonify({'error': 'Dla typu workplace, workplace_id jest wymagane'}), 400
                
            workplace = Workplace.query.filter_by(
                id=data['workplace_id'], 
                owner_id=user_id
            ).first_or_404()
            
            revenue.workplace_id = workplace.id
            revenue.employee_id = None

        elif revenue_type == 'employee':
            # Dla typu employee, employee_id jest wymagane
            if not data.get('employee_id'):
                return jsonify({'error': 'Dla typu employee, employee_id jest wymagane'}), 400
                
            employee = Employee.query.filter_by(
                id=data['employee_id'],
                user_id=user_id
            ).first_or_404()
            
            # Dla pracownika musimy znaleźć jego aktywne miejsce pracy
            workplace_assignment = WorkplaceAssignment.query.filter_by(
                employee_id=employee.id,
                status='active'
            ).first()
            
            if not workplace_assignment:
                return jsonify({'error': 'Pracownik nie ma przypisanego aktywnego miejsca pracy'}), 400
                
            workplace = workplace_assignment.workplace
            revenue.workplace_id = workplace.id
            revenue.employee_id = employee.id
            
        if 'description' in data:
            revenue.description = data['description']
        if 'amount' in data:
            revenue.amount = data['amount']
        if 'date' in data:
            revenue.date = datetime.fromisoformat(data['date'])
        
        db.session.commit()
        
        return jsonify({
            'id': revenue.id,
            'workplace_id': revenue.workplace_id,
            'workplace_name': workplace.name,
            'employee_id': revenue.employee_id,
            'employee_name': f"{employee.first_name} {employee.last_name}" if employee else None,
            'description': revenue.description,
            'amount': float(revenue.amount),
            'date': revenue.date.isoformat(),
            'updated_at': revenue.updated_at.isoformat()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@revenues_bp.route('/<uuid:id>', methods=['DELETE'])
@jwt_required()
def delete_revenue(id):
    user_id = get_jwt_identity()
    
    try:
        revenue = WorkplaceRevenue.query.join(
            Workplace, WorkplaceRevenue.workplace_id == Workplace.id
        ).filter(
            WorkplaceRevenue.id == id,
            Workplace.owner_id == user_id
        ).first_or_404()
        
        db.session.delete(revenue)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 