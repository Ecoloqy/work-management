from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Employee, User, EmployeeCost

employees_bp = Blueprint('employees', __name__)

@employees_bp.route('', methods=['GET'])
@jwt_required()
def get_employees():
    user_id = get_jwt_identity()
    employees = Employee.query.filter_by(manager_id=user_id).all()
    
    return jsonify([{
        'id': emp.id,
        'first_name': emp.first_name,
        'last_name': emp.last_name,
        'email': emp.email,
        'phone': emp.phone,
        'position': emp.position,
        'hourly_rate': float(emp.hourly_rate)
    } for emp in employees])

@employees_bp.route('', methods=['POST'])
@jwt_required()
def create_employee():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if Employee.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
        
    employee = Employee(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        phone=data.get('phone'),
        position=data.get('position'),
        hourly_rate=data['hourly_rate'],
        manager_id=user_id
    )
    
    db.session.add(employee)
    db.session.commit()
    
    return jsonify({
        'id': employee.id,
        'first_name': employee.first_name,
        'last_name': employee.last_name,
        'email': employee.email,
        'phone': employee.phone,
        'position': employee.position,
        'hourly_rate': float(employee.hourly_rate)
    }), 201

@employees_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_employee(id):
    user_id = get_jwt_identity()
    employee = Employee.query.filter_by(id=id, manager_id=user_id).first_or_404()
    
    return jsonify({
        'id': employee.id,
        'first_name': employee.first_name,
        'last_name': employee.last_name,
        'email': employee.email,
        'phone': employee.phone,
        'position': employee.position,
        'hourly_rate': float(employee.hourly_rate)
    })

@employees_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_employee(id):
    user_id = get_jwt_identity()
    employee = Employee.query.filter_by(id=id, manager_id=user_id).first_or_404()
    data = request.get_json()
    
    if 'email' in data and data['email'] != employee.email:
        if Employee.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
    
    for key, value in data.items():
        setattr(employee, key, value)
    
    db.session.commit()
    
    return jsonify({
        'id': employee.id,
        'first_name': employee.first_name,
        'last_name': employee.last_name,
        'email': employee.email,
        'phone': employee.phone,
        'position': employee.position,
        'hourly_rate': float(employee.hourly_rate)
    })

@employees_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_employee(id):
    user_id = get_jwt_identity()
    employee = Employee.query.filter_by(id=id, manager_id=user_id).first_or_404()
    
    db.session.delete(employee)
    db.session.commit()
    
    return '', 204

@employees_bp.route('/<int:id>/costs', methods=['GET'])
@jwt_required()
def get_employee_costs(id):
    user_id = get_jwt_identity()
    employee = Employee.query.filter_by(id=id, manager_id=user_id).first_or_404()
    
    costs = EmployeeCost.query.filter_by(employee_id=id).all()
    return jsonify([{
        'id': cost.id,
        'description': cost.description,
        'amount': float(cost.amount),
        'date': cost.date.isoformat()
    } for cost in costs])

@employees_bp.route('/<int:id>/costs', methods=['POST'])
@jwt_required()
def add_employee_cost(id):
    user_id = get_jwt_identity()
    employee = Employee.query.filter_by(id=id, manager_id=user_id).first_or_404()
    data = request.get_json()
    
    cost = EmployeeCost(
        employee_id=id,
        description=data['description'],
        amount=data['amount'],
        date=data['date']
    )
    
    db.session.add(cost)
    db.session.commit()
    
    return jsonify({
        'id': cost.id,
        'description': cost.description,
        'amount': float(cost.amount),
        'date': cost.date.isoformat()
    }), 201 