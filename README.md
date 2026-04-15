# FitFlow - Gym membership and class booking system

A web-based system for managing gym memberships, class scheduling, and bookings with role-based access control.

<img width="1896" height="887" alt="image" src="https://github.com/user-attachments/assets/e912f2f5-8bd4-4edf-ba99-4ec19c1d179f" />

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (React) + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Deploy | Docker + Docker Compose |

---

## Architecture

Service-Based Architecture with 5 domain services:
- **Membership Service** — plans & status
- **Scheduling Service** — classes & slots
- **Booking Service** — book & cancel
- **Attendance Service** — mark & records
- **Reports Service** — dashboard & analytics

All services share one PostgreSQL database and communicate through a central API Gateway (Express router).

---

## User Roles

| Role | Access |
|------|--------|
| Admin | Full system access — manage users, plans, classes, reports |
| Trainer | Manage own sessions, mark attendance |
| Member | Book/cancel classes, view membership |

---

## How to Run

### Prerequisites
- Docker Desktop installed and running
- Git

### Steps

**1. Clone the repo:**
```bash
git clone <your-repo-url>
cd FitFlow
```

**2. Start everything with Docker:**
```bash
docker-compose up --build
```

**3. Open in browser:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health

---

## Features

- Secure JWT authentication with bcrypt password hashing
- Role-based access control (Admin / Trainer / Member)
- Class booking with real-time capacity control
- Overbooking prevention using database transactions
- Attendance tracking per session
- Admin reporting dashboard
- Fully containerized with Docker
