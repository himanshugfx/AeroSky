# Aerosys Aviation India - Frontend

**Advanced Drone Solutions & Compliance Platform UI for DGCA Regulatory Requirements**

Aerosys Aviation India Private Limited (IIT Kanpur Incubated) provides a comprehensive web-based compliance ecosystem for Indian drone manufacturers and service providers. This repository contains the standalone frontend application.

![License](https://img.shields.io/badge/license-Proprietary-blue)
![Node](https://img.shields.io/badge/node-18+-green)

---

## Features

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

---

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **State**: Zustand 4.5, React Query 5.17
- **Maps**: Mapbox GL JS

---

## Installation

### Prerequisites

- Node.js 18+
- Git

### Setup

```bash
cd frontend
npm install
```

---

## Running the Application

```bash
cd frontend
npm run dev
```

Access:
- Frontend: http://localhost:3000

---

## Project Structure

```
AeroSky/
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js pages
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── login/              # Authentication
│   │   │   ├── docs/               # Documentation
│   │   │   └── dashboard/          # Protected dashboard
│   │   └── lib/                    # Utilities
│   │       ├── api.ts              # API client (Mocked)
│   │       └── store.ts            # Zustand state
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## Compliance Modules

### NPNT Engine

The NPNT (No Permission No Takeoff) engine implementation includes frontend validation for:
1. Drone Status
2. UIN Validity
3. Type Certification
4. Pilot RPC
5. Insurance Validity
6. Maintenance Status
7. Zone Restrictions
8. Altitude Limits
9. Pilot Rating

---

## License

Proprietary - All Rights Reserved

---

## Support

For support, contact: contact@aerosysaviation.com

---

*Built with ❤️ for Indian Aviation*
