# FitFlow - Gym membership and class booking system

A web-based system for managing gym memberships, class scheduling, and bookings with role-based access control.

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

### Architecture Layers:
- Presentation Layer (Frontend UI)
- Application Layer (Backend API)
- Data Layer (PostgreSQL)

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
git clone https://github.com/spr-ary/FitFlow.git
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

## Admin
<img width="1891" height="883" alt="image" src="https://github.com/user-attachments/assets/7cc46deb-1457-419f-9966-8e700b4c9462" />


<img width="1919" height="871" alt="image" src="https://github.com/user-attachments/assets/a3555b9e-9084-48d8-897d-6bb5703ea966" />


<img width="1919" height="883" alt="image" src="https://github.com/user-attachments/assets/c27ccb29-2d6b-4c7d-9857-3a3d60b20617" />


## Member
<img width="1896" height="887" alt="image" src="https://github.com/user-attachments/assets/086a8423-6f43-4f4c-be20-d5d3555feea3" />


<img width="1893" height="886" alt="image" src="https://github.com/user-attachments/assets/65fce17e-991e-4633-8304-841d87352f8e" />


<img width="1895" height="888" alt="image" src="https://github.com/user-attachments/assets/f5aa67aa-205b-4955-a8ca-6981ee407db6" />


## Trainer
<img width="1892" height="837" alt="image" src="https://github.com/user-attachments/assets/5c7df7f4-fb74-45d1-9101-9eaed0cfc4f4" />


<img width="1891" height="837" alt="image" src="https://github.com/user-attachments/assets/4cb72c69-c199-47e6-99c1-ace844c5fa5f" />


<img width="1919" height="829" alt="image" src="https://github.com/user-attachments/assets/61fd340b-f787-4a08-af45-64ee51628d7a" />














