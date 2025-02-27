from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import func
from .. import db
from ..models import Schedule, Workplace, Employee

schedules_bp = Blueprint('schedules', __name__)

@schedules_bp.route('', methods=['GET'])
@jwt_required()
def get_schedules():
    user_id = get_jwt_identity()
    
    # Pobierz wszystkie grafiki dla miejsc pracy użytkownika
    schedules = Schedule.query\
        .join(Workplace)\
        .filter(Workplace.owner_id == user_id)\
        .all()
    
    result = []
    for schedule in schedules:
        result.append({
            'id': str(schedule.id),
            'workplace_id': str(schedule.workplace_id),
            'workplace_name': schedule.workplace.name,
            'employee_id': str(schedule.employee_id),
            'employee_name': f"{schedule.employee.first_name} {schedule.employee.last_name}",
            'date': schedule.date.isoformat(),
            'hours': schedule.hours,
            'created_at': schedule.created_at.isoformat()
        })
    
    return jsonify(result)

@schedules_bp.route('', methods=['POST'])
@jwt_required()
def create_schedule():
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        # Sprawdź czy miejsce pracy należy do użytkownika
        workplace = Workplace.query.filter_by(
            id=data['workplace_id'],
            owner_id=user_id
        ).first_or_404()

        # Sprawdź czy pracownik istnieje
        employee = Employee.query.filter_by(id=data['employee_id']).first_or_404()

        # Konwertuj datę z formatu ISO
        schedule_date = datetime.fromisoformat(data['date']).date()
        hours = float(data['hours'])

        # Sprawdź czy liczba godzin jest prawidłowa
        if hours <= 0 or hours > 24:
            return jsonify({'error': 'Nieprawidłowa liczba godzin'}), 400

        # Sprawdź łączną liczbę godzin pracownika w danym dniu
        total_hours = db.session.query(func.sum(Schedule.hours))\
            .filter(
                Schedule.employee_id == employee.id,
                Schedule.date == schedule_date
            ).scalar() or 0

        # Sprawdź czy łączna liczba godzin nie przekracza 24
        if total_hours + hours > 24:
            return jsonify({'error': 'Łączna liczba godzin w danym dniu nie może przekraczać 24'}), 400

        # Utwórz nowy grafik
        schedule = Schedule(
            workplace_id=workplace.id,
            employee_id=employee.id,
            date=schedule_date,
            hours=hours
        )

        db.session.add(schedule)
        db.session.commit()

        return jsonify({
            'id': str(schedule.id),
            'workplace_id': str(schedule.workplace_id),
            'workplace_name': workplace.name,
            'employee_id': str(schedule.employee_id),
            'employee_name': f"{employee.first_name} {employee.last_name}",
            'date': schedule.date.isoformat(),
            'hours': schedule.hours,
            'created_at': schedule.created_at.isoformat()
        }), 201

    except KeyError as e:
        return jsonify({'error': f'Brak wymaganego pola: {str(e)}'}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

@schedules_bp.route('/<uuid:id>', methods=['PUT'])
@jwt_required()
def update_schedule(id):
    user_id = get_jwt_identity()
    data = request.get_json()

    # Sprawdź czy grafik istnieje i należy do użytkownika
    schedule = Schedule.query.join(Workplace).filter(
        Schedule.id == id,
        Workplace.owner_id == user_id
    ).first_or_404()

    try:
        # Sprawdź czy pracownik i miejsce pracy istnieją
        workplace = Workplace.query.filter_by(id=data['workplace_id'], owner_id=user_id).first_or_404()
        employee = Employee.query.filter_by(id=data['employee_id']).first_or_404()

        # Walidacja danych
        if not all(key in data for key in ['workplace_id', 'employee_id', 'date', 'hours']):
            return jsonify({'error': 'Brak wymaganych pól'}), 400

        # Walidacja godzin
        try:
            hours = float(data['hours'])
            if hours <= 0 or hours > 24:
                return jsonify({'error': 'Nieprawidłowa liczba godzin'}), 400
        except ValueError:
            return jsonify({'error': 'Nieprawidłowy format godzin'}), 400

        # Sprawdź całkowitą liczbę godzin dla pracownika w danym dniu
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        total_hours = db.session.query(func.sum(Schedule.hours)).filter(
            Schedule.employee_id == employee.id,
            Schedule.date == date,
            Schedule.id != id  # Wykluczamy aktualnie edytowany grafik
        ).scalar() or 0

        # Sprawdź czy suma godzin nie przekracza 24
        if total_hours + hours > 24:
            return jsonify({'error': f'Całkowita liczba godzin w dniu {data["date"]} nie może przekroczyć 24 (obecnie zaplanowane: {total_hours}h)'}), 400

        # Aktualizuj grafik
        schedule.workplace_id = workplace.id
        schedule.employee_id = employee.id
        schedule.date = date
        schedule.hours = hours

        db.session.commit()

        return jsonify({
            'id': str(schedule.id),
            'workplace_id': str(schedule.workplace_id),
            'workplace_name': workplace.name,
            'employee_id': str(schedule.employee_id),
            'employee_name': f'{employee.first_name} {employee.last_name}',
            'date': schedule.date.isoformat(),
            'hours': schedule.hours,
            'created_at': schedule.created_at.isoformat()
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@schedules_bp.route('/<uuid:id>', methods=['DELETE'])
@jwt_required()
def delete_schedule(id):
    user_id = get_jwt_identity()
    
    try:
        # Pobierz grafik i sprawdź uprawnienia
        schedule = Schedule.query.join(
            Workplace, Schedule.workplace_id == Workplace.id
        ).filter(
            Schedule.id == id,
            Workplace.owner_id == user_id
        ).first_or_404()
        
        db.session.delete(schedule)
        db.session.commit()
        
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 