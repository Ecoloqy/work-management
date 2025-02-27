# Ten plik jest pusty, ale jest wymagany do traktowania katalogu jako moduł Pythona 

from .auth import auth_bp
from .employees import employees_bp as employee_bp
from .workplaces import workplaces_bp as workplace_bp
from .users import users
from .costs import costs_bp
from .revenues import revenues_bp

__all__ = ['auth_bp', 'employee_bp', 'workplace_bp', 'users', 'costs_bp', 'revenues_bp'] 