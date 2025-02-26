import os
from dotenv import load_dotenv
from app import create_app, db
from app.models import User

def init_db():
    # Załaduj zmienne środowiskowe
    load_dotenv()
    
    # Upewnij się, że mamy wszystkie potrzebne zmienne środowiskowe
    required_vars = ['FLASK_APP', 'FLASK_ENV']
    for var in required_vars:
        if not os.getenv(var):
            raise ValueError(f'Brak wymaganej zmiennej środowiskowej: {var}')
    
    # Utwórz aplikację w odpowiednim trybie
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    
    with app.app_context():
        # Upewnij się, że wszystkie tabele istnieją
        db.create_all()
        
        # Sprawdzenie czy istnieje użytkownik admin
        admin = User.query.filter_by(email='admin@example.com').first()
        if not admin:
            print('Tworzenie użytkownika administratora...')
            admin = User(
                email='admin@example.com',
                first_name='Admin',
                last_name='User',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('Utworzono użytkownika administratora')
            print('Email: admin@example.com')
            print('Hasło: admin123')
        else:
            print('Użytkownik administrator już istnieje')

if __name__ == '__main__':
    init_db() 