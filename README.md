# 🏠 HomeEase — Full Stack Web Application

**Web Application Development — Semester Project**  
**Student:** Saad Wajid  
**Technology Stack:** React JS + Django REST Framework + SQLite

---

## 🌐 Links
- **GitHub:** https://github.com/saadwjd/homeease-web
- **Live Demo:** Coming soon (deployment in progress)

---

## 📋 Project Overview

HomeEase is a full-stack web application that connects homeowners with verified home service professionals in Pakistan. Users can browse providers, book services, and manage bookings through a responsive web interface.

---

## ✅ Features Implemented

### Mandatory Features
- ✅ **User Authentication** — Register, Login, Logout with JWT tokens
- ✅ **Responsive Design** — Mobile-first CSS with breakpoints
- ✅ **CRUD Operations** — Bookings (Create, Read, Update, Cancel), Profile (Read, Update), Reviews (Create, Read)
- ✅ **REST API Integration** — Axios with JWT auth headers and token refresh
- ✅ **Database Connectivity** — SQLite via Django ORM
- ✅ **Form Validation** — Client-side (React) + Server-side (Django serializers)
- ✅ **Navigation Routing** — React Router v6 with protected routes
- ✅ **Error Handling** — API errors, form errors, loading states, empty states

### Optional Features
- ✅ **File Uploading** — Profile photo upload with preview
- ✅ **Charts & Graphs** — Dashboard stats with visual stat cards
- ✅ **Real-time-like Notifications** — Booking status updates

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React JS 18, React Router v6, Axios, CSS3 |
| Backend | Django 4.2, Django REST Framework |
| Database | SQLite (Django ORM) |
| Auth | JWT (djangorestframework-simplejwt) |
| Version Control | Git & GitHub |

---

## 🚀 Setup Instructions

### Backend (Django)
```bash
cd backend
chmod +x setup.sh
./setup.sh

# Start server
source venv/bin/activate
python manage.py runserver
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@homeease.pk | admin123 |
| Customer | ali@example.com | password123 |
| Provider | ahmad@provider.com | password123 |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | Register new user |
| POST | /api/auth/login/ | Login & get tokens |
| POST | /api/auth/logout/ | Logout |
| GET/PATCH | /api/auth/profile/ | Get/Update profile |
| GET | /api/providers/ | List providers (with search/filter) |
| GET | /api/providers/{id}/ | Get provider detail |
| GET | /api/providers/{id}/reviews/ | Get provider reviews |
| GET/POST | /api/bookings/ | List/Create bookings |
| PATCH | /api/bookings/{id}/update_status/ | Update booking status |
| POST | /api/bookings/{id}/cancel/ | Cancel booking |
| GET/POST | /api/reviews/ | List/Create reviews |
| GET | /api/services/ | List service categories |
| GET | /api/dashboard/stats/ | Dashboard statistics |
| POST | /api/contact/ | Submit contact message |

---

## 📁 Project Structure

```
homeease_web/
├── backend/
│   ├── config/          # Django settings, URLs, WSGI
│   ├── homeease_api/    # Models, Views, Serializers, URLs
│   ├── manage.py
│   ├── requirements.txt
│   └── setup.sh
└── frontend/
    ├── public/
    └── src/
        ├── components/  # Navbar, Footer
        ├── context/     # AuthContext (React Context API)
        ├── pages/       # Home, Services, Login, Register, Dashboard, etc.
        ├── utils/       # Axios API instance
        ├── App.js       # Router setup
        └── App.css      # Complete design system
```

---

## 📸 Screenshots

### Home Page
- Hero section with animated stats
- Service categories grid
- Featured providers
- Testimonials

### Services Page  
- Search by name/skill
- Filter by category, price, rating
- Provider cards with booking option

### Dashboard
- Stats overview
- Bookings table with status management
- Profile editing with photo upload
- Provider profile management (for providers)
- Review system

---

© 2025 Saad Wajid — Web Application Development Project
