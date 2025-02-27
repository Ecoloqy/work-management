from datetime import datetime
from app import db
import uuid

class Workplace(db.Model):
    __tablename__ = 'workplaces'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    manager_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacje
    assignments = db.relationship('WorkplaceAssignment', backref='workplace', lazy='dynamic')
    costs = db.relationship('WorkplaceCost', backref='workplace', lazy='dynamic')
    revenues = db.relationship('WorkplaceRevenue', backref='workplace', lazy='dynamic')

    def __repr__(self):
        return f'<Workplace {self.name}>'

class WorkplaceAssignment(db.Model):
    __tablename__ = 'workplace_assignments'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workplace_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('workplaces.id'), nullable=False)
    employee_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('employees.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<WorkplaceAssignment {self.workplace_id} - {self.employee_id}>'

class WorkplaceCost(db.Model):
    __tablename__ = 'workplace_costs'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workplace_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('workplaces.id'), nullable=False)
    description = db.Column(db.String(200))
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<WorkplaceCost {self.workplace_id} - {self.amount}>'

class WorkplaceRevenue(db.Model):
    __tablename__ = 'workplace_revenues'

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workplace_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('workplaces.id'), nullable=True)
    description = db.Column(db.String(200))
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<WorkplaceRevenue {self.workplace_id} - {self.amount}>' 