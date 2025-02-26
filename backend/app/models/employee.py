from datetime import datetime
from app import db

class Employee(db.Model):
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    department = db.Column(db.String(100))
    hire_date = db.Column(db.DateTime, default=datetime.utcnow)
    salary = db.Column(db.Float)
    hourly_rate = db.Column(db.Float)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacje
    user = db.relationship('User', back_populates='employee')
    workplace_assignments = db.relationship('WorkplaceAssignment', backref='employee', lazy='dynamic')
    costs = db.relationship('EmployeeCost', backref='employee', lazy='dynamic')

    def __repr__(self):
        return f'<Employee {self.id} - User {self.user_id}>'

class EmployeeCost(db.Model):
    __tablename__ = 'employee_costs'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    description = db.Column(db.String(200))
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<EmployeeCost {self.employee_id} - {self.amount}>' 