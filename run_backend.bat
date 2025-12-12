@echo off
echo Starting Mattter Backend...
cd mattter_backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo Applying migrations...
python manage.py migrate

echo Starting Django Server...
python manage.py runserver
pause
