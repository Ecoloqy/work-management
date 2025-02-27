from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .. import db

class Schedule(db.Model):
    __tablename__ = 'schedules'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workplace_id = db.Column(UUID(as_uuid=True), db.ForeignKey('workplaces.id'), nullable=False)
    employee_id = db.Column(UUID(as_uuid=True), db.ForeignKey('employees.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    hours = db.Column(db.Float, nullable=False)  # liczba godzin w danym dniu
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacje
    workplace = db.relationship('Workplace', backref=db.backref('schedules', lazy=True))
    employee = db.relationship('Employee', backref=db.backref('schedules', lazy=True))

    def __repr__(self):
        return f'<Schedule {self.id}>' 