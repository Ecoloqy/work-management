from app import create_app, db
from config import Config

app = create_app(Config)

if __name__ == '__main__':
    with app.app_context():
        # Upewnij się, że wszystkie tabele istnieją
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True) 