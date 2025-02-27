from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from datetime import date
from .. import db
from ..models import Workplace, WorkplaceAssignment, WorkplaceCost, WorkplaceRevenue, Employee

workplaces_bp = Blueprint('workplaces', __name__)

@workplaces_bp.route('', methods=['GET'])
@jwt_required()
def get_workplaces():
    user_id = get_jwt_identity()
    workplaces = Workplace.query.filter_by(owner_id=user_id).all()
    
    # Pobierz aktualny miesiąc i rok
    today = date.today()
    first_day = date(today.year, today.month, 1)
    
    workplace_stats = {}
    for wp in workplaces:
        # Oblicz sumę kosztów
        costs = db.session.query(func.sum(WorkplaceCost.amount)).filter(
            WorkplaceCost.workplace_id == wp.id,
            func.date_trunc('month', WorkplaceCost.date) == first_day
        ).scalar() or 0
        
        # Oblicz sumę przychodów
        revenues = db.session.query(func.sum(WorkplaceRevenue.amount)).filter(
            WorkplaceRevenue.workplace_id == wp.id,
            func.date_trunc('month', WorkplaceRevenue.date) == first_day
        ).scalar() or 0
        
        workplace_stats[wp.id] = {
            'monthly_costs': float(costs),
            'monthly_revenues': float(revenues)
        }
    
    return jsonify([{
        'id': wp.id,
        'name': wp.name,
        'location': wp.location,
        'description': wp.description,
        'monthly_costs': workplace_stats[wp.id]['monthly_costs'],
        'monthly_revenues': workplace_stats[wp.id]['monthly_revenues']
    } for wp in workplaces])

@workplaces_bp.route('', methods=['POST'])
@jwt_required()
def create_workplace():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    workplace = Workplace(
        name=data['name'],
        location=data.get('location'),
        description=data.get('description'),
        owner_id=user_id
    )
    
    db.session.add(workplace)
    db.session.commit()
    
    return jsonify({
        'id': workplace.id,
        'name': workplace.name,
        'location': workplace.location,
        'description': workplace.description
    }), 201

@workplaces_bp.route('/<uuid:id>', methods=['GET'])
@jwt_required()
def get_workplace(id):
    user_id = get_jwt_identity()
    workplace = Workplace.query.filter_by(id=id, owner_id=user_id).first_or_404()
    
    return jsonify({
        'id': workplace.id,
        'name': workplace.name,
        'location': workplace.location,
        'description': workplace.description
    })

@workplaces_bp.route('/<uuid:id>', methods=['PUT'])
@jwt_required()
def update_workplace(id):
    user_id = get_jwt_identity()
    workplace = Workplace.query.filter_by(id=id, owner_id=user_id).first_or_404()
    data = request.get_json()
    
    for key, value in data.items():
        setattr(workplace, key, value)
    
    db.session.commit()
    
    return jsonify({
        'id': workplace.id,
        'name': workplace.name,
        'location': workplace.location,
        'description': workplace.description
    })

@workplaces_bp.route('/<uuid:id>', methods=['DELETE'])
@jwt_required()
def delete_workplace(id):
    user_id = get_jwt_identity()
    workplace = Workplace.query.filter_by(id=id, owner_id=user_id).first_or_404()
    
    db.session.delete(workplace)
    db.session.commit()
    
    return '', 204

@workplaces_bp.route('/<uuid:id>/employees', methods=['GET'])
@jwt_required()
def get_workplace_employees(id):
    user_id = get_jwt_identity()
    workplace = Workplace.query.filter_by(id=id, owner_id=user_id).first_or_404()
    
    assignments = WorkplaceAssignment.query.filter_by(workplace_id=id).all()
    return jsonify([{
        'id': assignment.employee.id,
        'first_name': assignment.employee.first_name,
        'last_name': assignment.employee.last_name,
        'email': assignment.employee.email,
        'start_date': assignment.start_date.isoformat(),
        'end_date': assignment.end_date.isoformat() if assignment.end_date else None
    } for assignment in assignments])

@workplaces_bp.route('/<uuid:id>/employees', methods=['POST'])
@jwt_required()
def assign_employee(id):
    user_id = get_jwt_identity()
    workplace = Workplace.query.filter_by(id=id, owner_id=user_id).first_or_404()
    data = request.get_json()
    
    employee = Employee.query.filter_by(id=data['employee_id'], manager_id=user_id).first_or_404()
    
    assignment = WorkplaceAssignment(
        employee_id=employee.id,
        workplace_id=id,
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data.get('end_date') else None
    )
    
    db.session.add(assignment)
    db.session.commit()
    
    return jsonify({
        'employee_id': employee.id,
        'workplace_id': id,
        'start_date': assignment.start_date.isoformat(),
        'end_date': assignment.end_date.isoformat() if assignment.end_date else None
    }), 201

@workplaces_bp.route('/<uuid:id>/costs', methods=['GET'])
@jwt_required()
def get_workplace_costs(id):
    user_id = get_jwt_identity()
    workplace = Workplace.query.filter_by(id=id, owner_id=user_id).first_or_404()
    
    costs = WorkplaceCost.query.filter_by(workplace_id=id).all()
    return jsonify([{
        'id': cost.id,
        'description': cost.description,
        'amount': float(cost.amount),
        'date': cost.date.isoformat()
    } for cost in costs])

@workplaces_bp.route('/<uuid:id>/costs', methods=['POST'])
@jwt_required()
def add_workplace_cost(id):
    user_id = get_jwt_identity()
    workplace = Workplace.query.filter_by(id=id, owner_id=user_id).first_or_404()
    data = request.get_json()
    
    cost = WorkplaceCost(
        workplace_id=id,
        description=data['description'],
        amount=data['amount'],
        date=datetime.strptime(data['date'], '%Y-%m-%d').date()
    )
    
    db.session.add(cost)
    db.session.commit()
    
    return jsonify({
        'id': cost.id,
        'description': cost.description,
        'amount': float(cost.amount),
        'date': cost.date.isoformat()
    }), 201

@workplaces_bp.route('/<uuid:id>/revenues', methods=['GET'])
@jwt_required()
def get_workplace_revenues(id):
    user_id = get_jwt_identity()
    workplace = Workplace.query.filter_by(id=id, owner_id=user_id).first_or_404()
    
    revenues = WorkplaceRevenue.query.filter_by(workplace_id=id).all()
    return jsonify([{
        'id': revenue.id,
        'description': revenue.description,
        'amount': float(revenue.amount),
        'date': revenue.date.isoformat()
    } for revenue in revenues])

@workplaces_bp.route('/<uuid:id>/revenues', methods=['POST'])
@jwt_required()
def add_workplace_revenue(id):
    user_id = get_jwt_identity()
    workplace = Workplace.query.filter_by(id=id, owner_id=user_id).first_or_404()
    data = request.get_json()
    
    revenue = WorkplaceRevenue(
        workplace_id=id,
        description=data['description'],
        amount=data['amount'],
        date=datetime.strptime(data['date'], '%Y-%m-%d').date()
    )
    
    db.session.add(revenue)
    db.session.commit()
    
    return jsonify({
        'id': revenue.id,
        'description': revenue.description,
        'amount': float(revenue.amount),
        'date': revenue.date.isoformat()
    }), 201 