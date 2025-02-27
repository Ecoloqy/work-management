from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import func
from .. import db
from ..models import WorkplaceRevenue, EmployeeRevenue, Workplace, Employee, WorkplaceAssignment

revenues_bp = Blueprint('revenues', __name__)

@revenues_bp.route('', methods=['GET'])
@jwt_required()
def get_revenues():
    manager_id = get_jwt_identity()
    
    workplace_revenues = db.session.query(WorkplaceRevenue).join(
        Workplace, WorkplaceRevenue.workplace_id == Workplace.id
    ).filter(
        Workplace.manager_id == manager_id
    ).all()
    
    employee_revenues = db.session.query(EmployeeRevenue).join(
        Employee, EmployeeRevenue.employee_id == Employee.id
    ).filter(
        Employee.manager_id == manager_id
    ).all()
    
    revenues = []
    
    for cost in workplace_revenues:
        revenues.append({
            'id': cost.id,
            'type': 'workplace',
            'workplace_id': cost.workplace_id,
            'workplace_name': cost.workplace.name,
            'description': cost.description,
            'amount': float(cost.amount),
            'date': cost.date.isoformat(),
            'created_at': cost.created_at.isoformat()
        })
    
    for cost in employee_revenues:
        revenues.append({
            'id': cost.id,
            'type': 'employee',
            'employee_id': cost.employee_id,
            'employee_name': f"{cost.employee.first_name} {cost.employee.last_name}",
            'description': cost.description,
            'amount': float(cost.amount),
            'date': cost.date.isoformat(),
            'created_at': cost.created_at.isoformat()
        })
    
    revenues.sort(key=lambda x: x['date'], reverse=True)
    
    return jsonify(revenues)

@revenues_bp.route('', methods=['POST'])
@jwt_required()
def create_revenue():
    manager_id = get_jwt_identity()
    data = request.get_json()
    
    revenue_type = data.get('type')
    if revenue_type not in ['workplace', 'employee']:
        return jsonify({'error': 'Nieprawidłowy typ przychodu'}), 400
    
    try:
        if revenue_type == 'workplace':
            workplace = Workplace.query.filter_by(
                id=data['workplace_id'], 
                manager_id=manager_id
            ).first_or_404()
            
            revenue = WorkplaceRevenue(
                workplace_id=data['workplace_id'],
                description=data['description'],
                amount=data['amount'],
                date=datetime.fromisoformat(data['date'])
            )
        else:
            employee = Employee.query.filter_by(
                id=data['employee_id'], 
                manager_id=manager_id
            ).first_or_404()
            
            revenue = EmployeeRevenue(
                employee_id=data['employee_id'],
                description=data['description'],
                amount=data['amount'],
                date=datetime.fromisoformat(data['date'])
            )
        
        db.session.add(revenue)
        db.session.commit()
        
        return jsonify({
            'id': revenue.id,
            'type': revenue_type,
            'description': revenue.description,
            'amount': float(revenue.amount),
            'date': revenue.date.isoformat(),
            'created_at': revenue.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@revenues_bp.route('/<string:type>/<uuid:id>', methods=['PUT'])
@jwt_required()
def update_revenue(type, id):
    manager_id = get_jwt_identity()
    data = request.get_json()
    
    try:
        if type == 'workplace':
            revenue = WorkplaceRevenue.query.join(
                Workplace, WorkplaceRevenue.workplace_id == Workplace.id
            ).filter(
                WorkplaceRevenue.id == id,
                Workplace.manager_id == manager_id
            ).first_or_404()
            
        elif type == 'employee':
            revenue = EmployeeRevenue.query.join(
                Employee, EmployeeRevenue.employee_id == Employee.id
            ).filter(
                EmployeeRevenue.id == id,
                Employee.manager_id == manager_id
            ).first_or_404()
        else:
            return jsonify({'error': 'Nieprawidłowy typ przychodu'}), 400
        
        if 'description' in data:
            revenue.description = data['description']
        if 'amount' in data:
            revenue.amount = data['amount']
        if 'date' in data:
            revenue.date = datetime.fromisoformat(data['date'])
        
        db.session.commit()
        
        return jsonify({
            'id': revenue.id,
            'type': type,
            'description': revenue.description,
            'amount': float(revenue.amount),
            'date': revenue.date.isoformat(),
            'updated_at': revenue.updated_at.isoformat()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@revenues_bp.route('/<string:type>/<uuid:id>', methods=['DELETE'])
@jwt_required()
def delete_revenue(type, id):
    manager_id = get_jwt_identity()
    
    try:
        if type == 'workplace':
            revenue = WorkplaceRevenue.query.join(
                Workplace, WorkplaceRevenue.workplace_id == Workplace.id
            ).filter(
                WorkplaceRevenue.id == id,
                Workplace.manager_id == manager_id
            ).first_or_404()
        elif type == 'employee':
            revenue = EmployeeRevenue.query.join(
                Employee, EmployeeRevenue.employee_id == Employee.id
            ).filter(
                EmployeeRevenue.id == id,
                Employee.manager_id == manager_id
            ).first_or_404()
        else:
            return jsonify({'error': 'Nieprawidłowy typ przychodu'}), 400
        
        db.session.delete(revenue)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 
