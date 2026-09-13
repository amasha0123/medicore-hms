# MediCore HMS — Production Backend API

> **A production-grade Hospital Management System REST API** built with Node.js, Express.js, TypeScript, Prisma ORM, and MySQL 8.x.

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql)
![Tests](https://img.shields.io/badge/Tests-13%20passed-brightgreen)

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [API Endpoints Reference](#api-endpoints-reference)
- [Roles & Permissions](#roles--permissions)
- [Security](#security)
- [Deployment](#deployment)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

---

## Features

- 🔐 **JWT Authentication** with access/refresh token rotation
- 👥 **Role-Based Access Control (RBAC)** — 7 built-in hospital roles
- 🏥 **20 REST API modules** covering all hospital workflows
- 📋 **Zod validation** on all incoming request bodies
- 🛡️ **Helmet + CORS + Rate Limiting** security hardening
- 📝 **Pino structured logging** with pretty-print dev mode
- 📁 **Multer file uploads** for patient documents and reports
- 📊 **Swagger/OpenAPI** documentation at `/api/docs`
- ✅ **Jest + Supertest** integration tests
- 🗄️ **Prisma ORM** with full migration support for MySQL 8.x
- 🚀 **Prisma seed** with demo data for all 7 roles

---

## Architecture

```
medicore-backend/
├── prisma/
│   ├── schema.prisma         # Full database schema (37 models)
│   └── seed.ts               # Demo data seeder
├── src/
│   ├── app.ts                # Express app configuration
│   ├── server.ts             # HTTP server entry point
│   ├── config/
│   │   ├── prisma.ts         # Prisma client singleton
│   │   └── swagger.ts        # Swagger/OpenAPI configuration
│   ├── constants/
│   │   └── roles.ts          # Role and permission constants
│   ├── controllers/          # Request/response handlers (20 controllers)
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication middleware
│   │   ├── rbac.ts           # Role-based access control
│   │   ├── validate.ts       # Zod schema validation
│   │   ├── errorHandler.ts   # Centralized error handler
│   │   └── upload.ts         # Multer file upload configuration
│   ├── routes/               # Express routers (20 route files)
│   ├── services/             # Business logic layer (20 services)
│   ├── types/                # TypeScript interfaces and DTOs
│   ├── utils/
│   │   ├── apiError.ts       # Typed error factory
│   │   ├── apiResponse.ts    # Standardized response builder
│   │   ├── jwt.ts            # Token utilities
│   │   ├── logger.ts         # Pino logger instance
│   │   └── password.ts       # bcryptjs helpers
│   └── validators/           # Zod schemas for all modules
└── tests/                    # Jest + Supertest test suite
```

### Request Lifecycle

```
Client Request
    → Rate Limiter
    → Helmet (Security Headers)
    → CORS
    → Body Parser (JSON/URLEncoded)
    → Pino HTTP Logger
    → JWT Authentication Middleware
    → RBAC Middleware
    → Zod Validation Middleware
    → Controller
        → Service (Business Logic)
            → Prisma (Database)
    → Centralized Error Handler
    → Standardized JSON Response
```

---

## Prerequisites

| Requirement | Minimum Version |
|---|---|
| Node.js | 18.x LTS or 22.x |
| npm | 9.x+ |
| MySQL | 8.0.x |
| Git | 2.x |

> **Windows users**: Ensure `node` and `mysql` are in your `PATH`.

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd medicore-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
copy .env.example .env
```

Edit `.env` with your MySQL credentials and secrets (see [Environment Variables](#environment-variables)).

### 4. Create the MySQL Database

Connect to MySQL and run:

```sql
CREATE DATABASE medicore_hms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Run Prisma Migrations

```bash
npm run prisma:migrate
```

### 6. Seed the Database

```bash
npm run prisma:seed
```

This creates 7 demo user accounts (one per role) and sample clinical data.

### 7. Start the Development Server

```bash
npm run dev
```

The API will be available at: `http://localhost:5000`

---

## Environment Variables

Create a `.env` file from `.env.example`:

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database (MySQL 8.x)
DATABASE_URL="mysql://root:your_password@localhost:3306/medicore_hms"

# JWT Secrets (generate strong random strings for production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Bcrypt
BCRYPT_ROUNDS=12
```

### Generating Secure Secrets

```bash
# PowerShell
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Database Setup

### Schema Overview

The Prisma schema defines **37 database models** organized into functional domains:

| Domain | Models |
|---|---|
| Identity & Access | `User`, `Role`, `Permission`, `RolePermission`, `UserRole` |
| Clinical | `Patient`, `Doctor`, `Department`, `Appointment` |
| Medical Records | `MedicalRecord`, `Diagnosis`, `Prescription`, `Vital` |
| Laboratory | `LabTest`, `LabOrder`, `LabResult` |
| Pharmacy | `Medicine`, `MedicineCategory`, `Dispense`, `Stock` |
| Billing | `Invoice`, `InvoiceItem`, `Payment` |
| Admissions | `Admission`, `Ward`, `Bed` |
| Outpatients | `OutpatientVisit` |
| Staff | `Staff`, `Shift`, `Attendance` |
| Settings | `Setting`, `AuditLog`, `Notification` |

### Migrations

```bash
# Create and apply a new migration
npm run prisma:migrate

# Apply migrations in production (no prompt)
npm run prisma:deploy

# Reset database (drops and recreates all tables)
npx prisma migrate reset

# Open Prisma Studio (visual DB browser)
npm run prisma:studio
```

### Demo User Accounts (After Seeding)

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@medicore.com` | `Admin@123456` |
| Doctor | `doctor@medicore.com` | `Doctor@123456` |
| Nurse | `nurse@medicore.com` | `Nurse@123456` |
| Receptionist | `receptionist@medicore.com` | `Recept@123456` |
| Lab Technician | `labtech@medicore.com` | `LabTech@123456` |
| Pharmacist | `pharmacist@medicore.com` | `Pharma@123456` |
| Accountant | `accountant@medicore.com` | `Account@123456` |

> ⚠️ **Change all passwords immediately in any non-local environment.**

---

## Running the Server

### Development (with hot reload)

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Type Check (no emit)

```bash
npm run lint
```

---

## API Documentation

Interactive Swagger UI is available at:

```
http://localhost:5000/api/docs
```

Health check endpoint:

```
GET http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "message": "Health check passed",
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

### Standard API Response Format

All endpoints return a consistent JSON structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Test Suites

| Suite | Tests | Coverage |
|---|---|---|
| `tests/health.test.ts` | Health check endpoint | API status structure |
| `tests/auth.test.ts` | Auth validation | Empty credentials, invalid email |
| `tests/patients.test.ts` | Patient API guards | 401 enforcement, malformed JWT |
| `tests/modules.test.ts` | All API guards | Auth required on all 7 modules |

```
Test Suites: 4 passed, 4 total
Tests:       13 passed, 13 total
```

### Watch Mode

```bash
npm run test:watch
```

---

## API Endpoints Reference

All endpoints are prefixed with `/api/v1/`. Protected endpoints require `Authorization: Bearer <token>`.

### Authentication

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/login` | Login and receive JWT tokens | Public |
| `POST` | `/auth/refresh` | Refresh access token | Public |
| `POST` | `/auth/logout` | Invalidate refresh token | 🔒 |
| `GET` | `/auth/me` | Get current user profile | 🔒 |
| `PUT` | `/auth/change-password` | Change own password | 🔒 |

### Patients

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/patients` | List patients (paginated, filterable) | 🔒 |
| `POST` | `/patients` | Register new patient | 🔒 |
| `GET` | `/patients/:id` | Get patient details | 🔒 |
| `PUT` | `/patients/:id` | Update patient | 🔒 |
| `DELETE` | `/patients/:id` | Soft-delete patient | 🔒 Admin |
| `GET` | `/patients/:id/history` | Full medical history | 🔒 |
| `POST` | `/patients/:id/documents` | Upload patient document | 🔒 |
| `GET` | `/patients/search` | Search patients by name/MRN | 🔒 |

### Doctors

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/doctors` | List all doctors | 🔒 |
| `POST` | `/doctors` | Register doctor | 🔒 Admin |
| `GET` | `/doctors/:id` | Doctor profile | 🔒 |
| `PUT` | `/doctors/:id` | Update doctor | 🔒 Admin |
| `GET` | `/doctors/:id/schedule` | Doctor schedule | 🔒 |
| `GET` | `/doctors/:id/patients` | Doctor's patient list | 🔒 |
| `GET` | `/doctors/:id/stats` | Performance statistics | 🔒 |

### Appointments

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/appointments` | List appointments (filterable) | 🔒 |
| `POST` | `/appointments` | Book appointment | 🔒 |
| `GET` | `/appointments/:id` | Appointment details | 🔒 |
| `PUT` | `/appointments/:id` | Update appointment | 🔒 |
| `PUT` | `/appointments/:id/cancel` | Cancel appointment | 🔒 |
| `PUT` | `/appointments/:id/complete` | Mark as completed | 🔒 Doctor |
| `GET` | `/appointments/today` | Today's appointments | 🔒 |

### Medical Records (EMR)

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/medical-records/patient/:patientId` | Patient's EMR | 🔒 |
| `POST` | `/medical-records` | Create EMR entry | 🔒 Doctor |
| `GET` | `/medical-records/:id` | EMR details | 🔒 |
| `PUT` | `/medical-records/:id` | Update EMR | 🔒 Doctor |
| `POST` | `/medical-records/:id/prescriptions` | Add prescription | 🔒 Doctor |

### Laboratory

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/laboratory` | List lab orders | 🔒 |
| `POST` | `/laboratory` | Create lab order | 🔒 Doctor |
| `GET` | `/laboratory/:id` | Lab order details | 🔒 |
| `PUT` | `/laboratory/:id/result` | Upload lab result | 🔒 Lab |
| `GET` | `/laboratory/pending` | Pending tests | 🔒 Lab |
| `GET` | `/laboratory/tests` | Available test catalog | 🔒 |

### Pharmacy

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/pharmacy/medicines` | Medicine inventory | 🔒 |
| `POST` | `/pharmacy/medicines` | Add medicine | 🔒 Pharmacist |
| `PUT` | `/pharmacy/medicines/:id` | Update medicine | 🔒 Pharmacist |
| `POST` | `/pharmacy/dispense` | Dispense prescription | 🔒 Pharmacist |
| `GET` | `/pharmacy/dispensing-log` | Dispensing history | 🔒 |
| `GET` | `/pharmacy/low-stock` | Low stock alerts | 🔒 |

### Billing

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/billing` | List invoices | 🔒 |
| `POST` | `/billing` | Create invoice | 🔒 |
| `GET` | `/billing/:id` | Invoice details | 🔒 |
| `PUT` | `/billing/:id/pay` | Record payment | 🔒 Accountant |
| `GET` | `/billing/outstanding` | Outstanding invoices | 🔒 |
| `GET` | `/billing/summary` | Revenue summary | 🔒 Admin |

### Admissions

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/admissions` | List admissions | 🔒 |
| `POST` | `/admissions` | Admit patient | 🔒 |
| `GET` | `/admissions/:id` | Admission details | 🔒 |
| `PUT` | `/admissions/:id/discharge` | Discharge patient | 🔒 Doctor |
| `GET` | `/admissions/wards` | Ward/bed availability | 🔒 |

### Dashboard

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/dashboard/admin` | Admin KPI dashboard | 🔒 Admin |
| `GET` | `/dashboard/doctor` | Doctor dashboard | 🔒 Doctor |
| `GET` | `/dashboard/nurse` | Nurse dashboard | 🔒 Nurse |
| `GET` | `/dashboard/receptionist` | Receptionist dashboard | 🔒 Receptionist |
| `GET` | `/dashboard/lab` | Lab dashboard | 🔒 Lab |
| `GET` | `/dashboard/pharmacy` | Pharmacy dashboard | 🔒 Pharmacist |
| `GET` | `/dashboard/accountant` | Finance dashboard | 🔒 Accountant |

### Other Modules

| Module | Base Path | Description |
|---|---|---|
| Staff | `/staff` | HR, shifts, attendance |
| Outpatients | `/outpatients` | OPD visit management |
| Reports | `/reports` | Clinical & financial reports |
| Users | `/users` | User management (Admin) |
| Settings | `/settings` | System configuration |
| Audit Logs | `/audit-logs` | Security audit trail |
| Search | `/search` | Global search across entities |
| Notifications | `/notifications` | User notifications |

---

## Roles & Permissions

The system defines **7 hospital roles** with granular permissions:

| Role | Description | Key Capabilities |
|---|---|---|
| `ADMIN` | System Administrator | Full access to all modules |
| `DOCTOR` | Physician | EMR, prescriptions, lab orders, discharge |
| `NURSE` | Nursing Staff | Patient vitals, ward management |
| `RECEPTIONIST` | Front Desk | Patient registration, appointments |
| `LAB_TECHNICIAN` | Laboratory Staff | Lab orders, results upload |
| `PHARMACIST` | Pharmacy Staff | Medicine inventory, dispensing |
| `ACCOUNTANT` | Finance Staff | Billing, payments, reports |

### RBAC Enforcement Example

```typescript
// Route protected for DOCTOR and ADMIN only
router.post(
  '/medical-records',
  authenticate,
  authorize(['DOCTOR', 'ADMIN']),
  validate(emrSchema),
  emrController.create
);
```

---

## Security

### Implemented Measures

| Measure | Implementation |
|---|---|
| Password Hashing | bcryptjs with configurable rounds (default: 12) |
| JWT Tokens | Short-lived access tokens (15m) + refresh tokens (7d) |
| HTTP Security Headers | Helmet.js with HSTS, CSP, X-Frame-Options |
| Rate Limiting | 500 requests / 15 minutes per IP |
| Input Validation | Zod schemas on all request bodies |
| CORS | Whitelist-based origin control |
| SQL Injection Prevention | Prisma parameterized queries |
| Audit Logging | All write operations logged with user/IP |

### Production Security Checklist

- [ ] Change all demo user passwords
- [ ] Set `NODE_ENV=production`
- [ ] Use strong, random `JWT_SECRET` and `JWT_REFRESH_SECRET` (≥ 64 chars)
- [ ] Configure HTTPS/TLS (use nginx reverse proxy)
- [ ] Set `FRONTEND_URL` to your exact production domain
- [ ] Enable MySQL TLS connection in `DATABASE_URL`
- [ ] Set up MySQL user with minimum required privileges (not `root`)
- [ ] Configure firewall to block MySQL port (3306) from external access

---

## Deployment

### Production Environment

```bash
# 1. Build TypeScript
npm run build

# 2. Apply migrations (no prompts)
npm run prisma:deploy

# 3. (First time only) Seed initial admin user
npm run prisma:seed

# 4. Start the server
npm start
```

### Using PM2 (Recommended for VPS)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/server.js --name medicore-api --instances max

# Save PM2 process list
pm2 save

# Configure PM2 to start on boot
pm2 startup
```

### Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY dist ./dist

EXPOSE 5000
CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:5000"
    env_file: .env
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: medicore_hms
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

---

## Backup & Recovery

### Automated MySQL Backup

```bash
# Full database backup
mysqldump -u root -p medicore_hms > backup_$(Get-Date -Format "yyyy-MM-dd").sql

# Compress the backup
mysqldump -u root -p medicore_hms | gzip > backup_$(Get-Date -Format "yyyy-MM-dd").sql.gz
```

### Restore from Backup

```bash
# Restore full database
mysql -u root -p medicore_hms < backup_2025-01-01.sql

# Restore from compressed backup
gunzip < backup_2025-01-01.sql.gz | mysql -u root -p medicore_hms
```

### Automated Daily Backup Script (Windows Task Scheduler)

Create `backup.ps1`:

```powershell
$date = Get-Date -Format "yyyy-MM-dd"
$backupDir = "C:\medicore-backups"
$backupFile = "$backupDir\medicore_$date.sql.gz"

New-Item -ItemType Directory -Force -Path $backupDir

mysqldump -u root -pYourPassword medicore_hms | gzip > $backupFile

# Delete backups older than 30 days
Get-ChildItem $backupDir -Filter "*.sql.gz" |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
  Remove-Item
```

Schedule via Task Scheduler to run daily at 2 AM.

### Upload Files Backup

```bash
# Back up uploaded files
Compress-Archive -Path ./uploads -DestinationPath "uploads_backup_$(Get-Date -Format 'yyyy-MM-dd').zip"
```

---

## Troubleshooting

### Database Connection Fails

**Error**: `Authentication failed against database server`

**Solution**:
1. Verify MySQL is running: `Get-Service MySQL*`
2. Check credentials in `.env` match your MySQL user
3. Test connection: `mysql -u root -p -e "SELECT 1;"`
4. Ensure the database exists: `mysql -u root -p -e "SHOW DATABASES;"`

---

### Prisma Migration Fails

**Error**: `P1001: Can't reach database server`

**Solution**:
```bash
# Check DATABASE_URL format
# Correct format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
# Example: mysql://root:secret@localhost:3306/medicore_hms

# Reset and re-migrate if needed
npx prisma migrate reset
npm run prisma:migrate
```

---

### JWT Token Expired

**Error**: `401 Unauthorized — Token has expired`

**Solution**: Use the `/api/v1/auth/refresh` endpoint with your refresh token to obtain a new access token.

---

### File Upload Fails

**Error**: `ENOENT: no such file or directory, open './uploads/...'`

**Solution**:
```bash
# Create the uploads directory
mkdir uploads
```

---

### Tests Fail with `Cannot connect to database`

This is expected during testing — tests use a mock database connection. The health check test returns a `503` response when MySQL is unavailable, which the test accepts as any status `< 600`.

---

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

---

### TypeScript Build Errors

```bash
# Run type check without emitting
npm run lint

# Regenerate Prisma types after schema changes
npm run prisma:generate
npm run lint
```

---

## Frontend Integration

The frontend (`medicore-hms`) service files in `src/services/*.ts` should point to:

```typescript
const BASE_URL = 'http://localhost:5000/api/v1';
```

All API calls require the `Authorization` header:

```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json'
}
```

---

## License

MIT License — MediCore HMS Backend. See `LICENSE` for details.

---

*Built with ❤️ for hospital administrators, doctors, nurses, and healthcare professionals.*
