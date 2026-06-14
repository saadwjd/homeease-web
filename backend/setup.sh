#!/bin/bash
# HomeEase Backend Setup Script
echo "Setting up HomeEase Backend..."

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations homeease_api
python manage.py migrate

# Seed sample data
python manage.py seed_data

# Create superuser (optional)
echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the backend server:"
echo "  source venv/bin/activate"
echo "  python manage.py runserver"
echo ""
echo "API will be available at: http://localhost:8000/api/"
echo "Admin panel: http://localhost:8000/admin/"
echo "Login: admin@homeease.pk / admin123"
