from setuptools import setup, find_packages

setup(
    name="work-management",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'flask',
        'flask-sqlalchemy',
        'flask-migrate',
        'flask-jwt-extended',
        'flask-cors',
        'psycopg2-binary',
        'python-dotenv',
    ],
) 