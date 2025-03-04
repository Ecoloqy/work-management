from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date
from sqlalchemy import func
from .. import db
from ..models import Employee, EmployeeCost, EmployeeRevenue

employees_bp = Blueprint('employees', __name__)

@employees_bp.route('', methods=['GET'])
@jwt_required()
def get_employees():
    manager_id = get_jwt_identity()
    employees = Employee.query.filter_by(manager_id=manager_id).all()

    today = date.today()
    first_day = date(today.year, today.month, 1)
    
    employee_stats = {}
    for emp in employees:
        costs = db.session.query(func.sum(EmployeeCost.amount)).filter(
            EmployeeCost.employee_id == emp.id,
            func.date_trunc('month', EmployeeCost.date) == first_day
        ).scalar() or 0

        revenues = db.session.query(func.sum(EmployeeRevenue.amount)).filter(
            EmployeeRevenue.employee_id == emp.id,
            func.date_trunc('month', EmployeeRevenue.date) == first_day
        ).scalar() or 0

        employee_stats[emp.id] = {
            'monthly_costs': float(costs),
            'monthly_revenues': float(revenues)
        }
    
    return jsonify([{
        'id': emp.id,
        'first_name': emp.first_name,
        'last_name': emp.last_name,
        'email': emp.email,
        'phone': emp.phone,
        'monthly_costs': employee_stats[emp.id]['monthly_costs'],
        'monthly_revenues': employee_stats[emp.id]['monthly_revenues']
    } for emp in employees])

@employees_bp.route('', methods=['POST'])
@jwt_required()
def create_employee():
    manager_id = get_jwt_identity()
    data = request.get_json()
    
    if Employee.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
        
    employee = Employee(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        phone=data.get('phone'),
        manager_id=manager_id
    )
    
    db.session.add(employee)
    db.session.commit()
    
    return jsonify({
        'id': employee.id,
        'first_name': employee.first_name,
        'last_name': employee.last_name,
        'email': employee.email,
        'phone': employee.phone
    }), 201

@employees_bp.route('/<uuid:id>', methods=['GET'])
@jwt_required()
def get_employee(id):
    manager_id = get_jwt_identity()
    employee = Employee.query.filter_by(id=id, manager_id=manager_id).first_or_404()
    
    return jsonify({
        'id': employee.id,
        'first_name': employee.first_name,
        'last_name': employee.last_name,
        'email': employee.email,
        'phone': employee.phone
    })

@employees_bp.route('/<uuid:id>', methods=['PUT'])
@jwt_required()
def update_employee(id):
    manager_id = get_jwt_identity()
    employee = Employee.query.filter_by(id=id, manager_id=manager_id).first_or_404()
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
        'phone': employee.phone
    })

@employees_bp.route('/<uuid:id>', methods=['DELETE'])
@jwt_required()
def delete_employee(id):
    manager_id = get_jwt_identity()
    employee = Employee.query.filter_by(id=id, manager_id=manager_id).first_or_404()
    
    db.session.delete(employee)
    db.session.commit()
    
    return '', 204

@employees_bp.route('/<uuid:id>/costs', methods=['GET'])
@jwt_required()
def get_employee_costs(id):
    manager_id = get_jwt_identity()
    employee = Employee.query.filter_by(id=id, manager_id=manager_id).first_or_404()
    
    costs = EmployeeCost.query.filter_by(employee_id=id).all()
    return jsonify([{
        'id': cost.id,
        'description': cost.description,
        'amount': float(cost.amount),
        'date': cost.date.isoformat()
    } for cost in costs])

@employees_bp.route('/<uuid:id>/revenues', methods=['GET'])
@jwt_required()
def get_employee_revenues(id):
    manager_id = get_jwt_identity()
    employee = Employee.query.filter_by(id=id, manager_id=manager_id).first_or_404()
    
    costs = EmployeeRevenue.query.filter_by(employee_id=id).all()
    return jsonify([{
        'id': cost.id,
        'description': cost.description,
        'amount': float(cost.amount),
        'date': cost.date.isoformat()
    } for cost in costs])

@employees_bp.route('/<uuid:id>/costs', methods=['POST'])
@jwt_required()
def add_employee_cost(id):
    manager_id = get_jwt_identity()
    employee = Employee.query.filter_by(id=id, manager_id=manager_id).first_or_404()
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

@employees_bp.route('/<uuid:id>/revenues', methods=['POST'])
@jwt_required()
def add_employee_revenue(id):
    manager_id = get_jwt_identity()
    employee = Employee.query.filter_by(id=id, manager_id=manager_id).first_or_404()
    data = request.get_json()
    
    cost = EmployeeRevenue(
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
