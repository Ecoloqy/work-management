# Work Management System

A comprehensive web application for managing employees and workplaces, built with Flask (Backend) and React (Frontend).

## Features

- User Authentication and Authorization
- Employee Management
- Workplace Management
- Cost and Revenue Tracking
- Role-based Access Control
- Real-time Data Updates

## Tech Stack

### Backend
- Python 3.11
- Flask 3.0.0
- PostgreSQL 15
- SQLAlchemy
- Flask-JWT-Extended
- Flask-Migrate
- Gunicorn

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- React Router
- Formik & Yup
- Axios

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- Docker and Docker Compose
- PowerShell 7 (pwsh)
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd work-management
```

2. Configure environment variables:
   - For development: Copy `.env.development.example` to `.env.development`
   - For production: Copy `.env.production.example` to `.env.production`

## Development Environment

The development environment runs the database in Docker, while the backend and frontend run locally.

### Starting Development Environment

Run the following command:
```powershell
.\start-dev.ps1
```

This script will:
1. Set up the development environment variables
2. Start PostgreSQL in Docker
3. Create and activate Python virtual environment
4. Install backend dependencies
5. Run database migrations
6. Start the Flask development server
7. Install frontend dependencies
8. Start the React development server

Development URLs:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

## Production Environment

The production environment runs all components (database, backend, and frontend) in Docker containers.

### Starting Production Environment

Run the following command:
```powershell
.\start-prod.ps1
```

This script will:
1. Set up the production environment variables
2. Build Docker images for all services
3. Start all containers
4. Run database migrations
5. Initialize the application

Production URLs:
- Application: http://localhost
- Backend API: http://localhost:5000
- Database: localhost:5432

## Default Admin Account

After initialization, you can log in using these credentials:
- Email: admin@example.com
- Password: admin123

## Database Management

### Development
- Database data is persisted in Docker volume: `work-management-postgres-dev`
- To reset the database: `docker-compose -f docker-compose.db.yml down -v`

### Production
- Database data is persisted in Docker volume: `work-management-postgres-prod`
- To reset the database: `docker-compose down -v`

## Project Structure

```
work-management/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   └── config.py
│   ├── migrations/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── theme.ts
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── docker-compose.db.yml
├── start-dev.ps1
└── start-prod.ps1
```

## API Documentation

### Authentication Endpoints
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### Employee Endpoints
- GET /api/employees - List employees
- POST /api/employees - Create employee
- GET /api/employees/:id - Get employee details
- PUT /api/employees/:id - Update employee
- DELETE /api/employees/:id - Delete employee

### Workplace Endpoints
- GET /api/workplaces - List workplaces
- POST /api/workplaces - Create workplace
- GET /api/workplaces/:id - Get workplace details
- PUT /api/workplaces/:id - Update workplace
- DELETE /api/workplaces/:id - Delete workplace

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is licensed under the MIT License. 