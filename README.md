# AeroSky India

**Drone Compliance Platform for DGCA Regulatory Requirements**

A comprehensive web-based compliance engine for Indian drone manufacturers and service providers, implementing DGCA regulations including Drone Rules 2021, Bharatiya Vayuyan Adhiniyam 2024, and Draft Civil Drone Bill 2025.

![License](https://img.shields.io/badge/license-Proprietary-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![Node](https://img.shields.io/badge/node-18+-green)

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Compliance Modules](#compliance-modules)
- [NPNT Engine](#npnt-engine)
- [Security](#security)
- [Regulatory References](#regulatory-references)

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Type Certification (D-1)** | Manage drone model certifications with complete specifications |
| **UIN Registration (D-2)** | Automated Unique Identification Number generation |
| **Pilot Certificates (D-4)** | Remote Pilot Certificate management with expiry tracking |
| **RPTO Management (D-5)** | Training organization authorization |
| **NPNT Validation** | 9-point compliance check before takeoff |
| **Flight Planning** | Polygon-based flight area with zone validation |
| **Flight Logging** | Tamper-proof logs with SHA-256 hash chain |
| **Maintenance Logbook** | Digital CA Form 19-10 equivalent |
| **Compliance Monitoring** | Automatic violation detection and tracking |

### Compliance Coverage

- ✅ Drone Rules, 2021 (as amended 2022, 2023)
- ✅ Bharatiya Vayuyan Adhiniyam, 2024
- ✅ Draft Civil Drone Bill, 2025
- ✅ Digital Sky Platform integration (mock)
- ✅ NPNT Protocol compliance

---

## Technology Stack

### Backend
- **Framework**: Python FastAPI 0.109+
- **ORM**: SQLAlchemy 2.0 (async)
- **Database**: PostgreSQL 15 (Neon serverless)
- **Extensions**: TimescaleDB (time-series), PostGIS (geospatial)
- **Auth**: JWT with bcrypt password hashing
- **Validation**: Pydantic 2.5+

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **State**: Zustand 4.5, React Query 5.17
- **Maps**: Mapbox GL JS

---

## Project Structure

```
DGCA/
├── backend/
│   ├── app/
│   │   ├── api/                    # API route handlers
│   │   │   ├── auth.py             # Authentication endpoints
│   │   │   ├── drones.py           # Drone registry endpoints
│   │   │   └── flights.py          # Flight operations endpoints
│   │   ├── core/                   # Core configuration
│   │   │   ├── config.py           # Environment settings
│   │   │   ├── database.py         # Async SQLAlchemy setup
│   │   │   ├── security.py         # JWT & password hashing
│   │   │   └── rbac.py             # Role-based access control
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   │   ├── registry.py         # Organizations, Users, Drones, Pilots
│   │   │   ├── operations.py       # Flight Plans, Logs, Artifacts
│   │   │   └── maintenance.py      # Maintenance, Violations, Audit
│   │   ├── schemas/                # Pydantic validation schemas
│   │   ├── services/               # Business logic services
│   │   │   ├── npnt_validator.py   # NPNT compliance engine
│   │   │   ├── log_ingestor.py     # Flight log processing
│   │   │   └── uin_generator.py    # UIN generation service
│   │   └── main.py                 # FastAPI application
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js pages
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── login/              # Authentication
│   │   │   ├── docs/               # Documentation
│   │   │   └── dashboard/          # Protected dashboard
│   │   └── lib/                    # Utilities
│   │       ├── api.ts              # API client
│   │       └── store.ts            # Zustand state
│   ├── package.json
│   └── tailwind.config.js
├── database/
│   └── schema.sql                  # PostgreSQL schema
└── README.md
```

---

## Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or Neon account)
- Git

### Clone Repository

```bash
git clone <repository-url>
cd DGCA
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### Database Setup

**Option 1: Neon (Recommended for Production)**

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string

**Option 2: Local PostgreSQL**

```bash
createdb AeroSky_india
psql AeroSky_india < database/schema.sql
```

---

## Configuration

### Backend Environment Variables

Create `backend/.env` from template:

```bash
cp backend/.env.example backend/.env
```

Edit with your values:

```env
# Application
APP_NAME=AeroSky India
APP_ENV=development
DEBUG=true
SECRET_KEY=your-secret-key-min-32-chars

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql+asyncpg://user:pass@host.neon.tech/dbname

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Digital Sky API (Mock mode for development)
DIGITAL_SKY_MOCK_MODE=true

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Production Build

```bash
# Backend
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000

# Frontend
npm run build
npm start
```

---

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login (returns JWT) |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/refresh` | Refresh token |

### Drones

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/drones` | List drones |
| POST | `/api/v1/drones` | Create drone |
| GET | `/api/v1/drones/{id}` | Get drone |
| PATCH | `/api/v1/drones/{id}` | Update drone |
| POST | `/api/v1/drones/generate-uin` | Generate UIN |
| POST | `/api/v1/drones/generate-uin/batch` | Batch UIN generation |
| POST | `/api/v1/drones/{id}/activate` | Activate drone |

### Flight Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/flights/plans` | List flight plans |
| POST | `/api/v1/flights/plans` | Create flight plan |
| POST | `/api/v1/flights/validate-npnt` | NPNT validation |
| POST | `/api/v1/flights/validate-zone` | Zone check |
| POST | `/api/v1/flights/logs/ingest` | Ingest flight logs |
| POST | `/api/v1/flights/plans/{id}/start` | Start flight |
| POST | `/api/v1/flights/plans/{id}/complete` | Complete flight |

---

## Database Schema

### Key Tables

| Table | Purpose | Form |
|-------|---------|------|
| `type_certificates` | Drone model specifications | D-1 |
| `drones` | Individual drone registry | D-2 |
| `transfers` | Ownership transfers | D-3 |
| `pilots` | Remote pilot certificates | D-4 |
| `rptos` | Training organizations | D-5 |
| `flight_plans` | Flight area and time | - |
| `flight_logs` | Time-series telemetry | - |
| `permission_artifacts` | NPNT authorization | - |
| `maintenance_logs` | Maintenance records | 19-10 |
| `compliance_violations` | Violation tracking | - |
| `audit_log` | Immutable audit trail | - |

---

## Compliance Modules

### NPNT Engine

The NPNT (No Permission No Takeoff) engine performs 9 compliance checks:

1. **Drone Status** - Must be 'Active'
2. **UIN Valid** - Must have registered UIN
3. **Type Certificate** - Must be certified and NPNT compliant
4. **Pilot RPC** - Must be active and not expired
5. **Insurance** - Must have valid policy
6. **Maintenance** - No overdue critical items
7. **Zone Status** - Cannot fly in RED zones
8. **Altitude Limits** - Within type certificate limits
9. **Pilot Rating** - Appropriate for drone class

### Flight Log Integrity

Logs use SHA-256 hash chaining:
```
Entry[n].hash = SHA256(timestamp + lat + lon + alt + seq + Entry[n-1].hash)
```

Tampering detection identifies:
- Modified entries (hash mismatch)
- Deleted entries (sequence gaps)
- Invalid signatures

---

## Security

### Authentication
- JWT-based with access/refresh tokens
- bcrypt password hashing
- Token expiry: 30 min (access), 7 days (refresh)

### Authorization (RBAC)

| Role | Permissions |
|------|-------------|
| System_Admin | All |
| Manufacturer | Type certs, UINs, Production |
| Fleet_Manager | Drones, Pilots, Flights |
| Pilot | Own flights, Own logs |
| Technician | Maintenance logs |
| DGCA_Auditor | Read-only, Time-travel |

---

## Regulatory References

- [Drone Rules, 2021](https://www.dgca.gov.in)
- [Drone Rules (Amendment), 2022](https://www.dgca.gov.in)
- [Drone Rules (Amendment), 2023](https://www.dgca.gov.in)
- [Bharatiya Vayuyan Adhiniyam, 2024](https://legislative.gov.in)
- [Draft Civil Drone Bill, 2025](https://www.dgca.gov.in)
- [Digital Sky Platform](https://digitalsky.dgca.gov.in)

---

## License

Proprietary - All Rights Reserved

---

## Support

For support, contact: support@AeroSkyindia.com

---

*Built with ❤️ for Indian Aviation*
