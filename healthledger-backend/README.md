# HealthVault — Backend API

Node.js + Express + MongoDB (local) + Cloudinary

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill your values
cp .env.example .env

# 3. Seed demo data (optional)
node src/utils/seed.js

# 4. Start dev server
npm run dev
```

Server runs at: http://localhost:5000

---

## Environment Variables (.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/healthvault
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=HealthVault <your@gmail.com>
CLIENT_URL=http://localhost:5173
```

---

## API Reference

### Auth  — /api/auth

| Method | Endpoint              | Auth | Description          |
|--------|-----------------------|------|----------------------|
| POST   | /register             | No   | Register patient or doctor |
| POST   | /login                | No   | Login, returns JWT   |
| GET    | /me                   | Yes  | Get current user     |
| PUT    | /change-password      | Yes  | Change password      |

### Users  — /api/users

| Method | Endpoint              | Auth   | Description          |
|--------|-----------------------|--------|----------------------|
| GET    | /profile              | Yes    | Get own profile      |
| PUT    | /profile              | Yes    | Update own profile   |
| GET    | /doctors              | Yes    | Search doctors       |

### Records  — /api/records  (Patient only)

| Method | Endpoint              | Auth    | Description          |
|--------|-----------------------|---------|----------------------|
| POST   | /upload               | Patient | Upload record to Cloudinary |
| GET    | /                     | Patient | List my records      |
| GET    | /timeline             | Patient | All records sorted by date |
| GET    | /:id                  | Patient | Get single record    |
| PUT    | /:id                  | Patient | Update record meta   |
| DELETE | /:id                  | Patient | Soft-delete + remove from Cloudinary |

**Upload body (multipart/form-data):**
```
file        — PDF/JPG/PNG (max 50MB)
title       — string
type        — Lab Report | Radiology | Prescription | Cardiology | Vaccination | Certificate | Consultation | General
doctor      — string
hospital    — string
notes       — string
tags        — comma-separated string e.g. "blood,routine"
status      — normal | review | critical
recordDate  — ISO date string
```

### Access Links  — /api/access-links

| Method | Endpoint              | Auth    | Description          |
|--------|-----------------------|---------|----------------------|
| POST   | /                     | Patient | Create share link    |
| GET    | /                     | Patient | My active links      |
| GET    | /shared/:token        | Public  | Doctor views records via token |
| PUT    | /:id/revoke           | Patient | Revoke link          |
| DELETE | /:id                  | Patient | Delete link          |

**Create link body:**
```json
{
  "recordIds": ["id1", "id2"],
  "sharedWith": { "email": "dr@hospital.com", "name": "Dr. X", "hospital": "Apollo" },
  "permission": "view",
  "expiryDays": 7
}
```

### Appointments  — /api/appointments

| Method | Endpoint              | Auth    | Description          |
|--------|-----------------------|---------|----------------------|
| POST   | /                     | Patient | Book appointment     |
| GET    | /                     | Patient | My appointments      |
| GET    | /doctor               | Doctor  | Doctor's appointments |
| PUT    | /:id/cancel           | Patient | Cancel appointment   |
| PUT    | /:id/complete         | Doctor  | Mark as completed    |

### Doctor  — /api/doctors

| Method | Endpoint              | Auth   | Description          |
|--------|-----------------------|--------|----------------------|
| GET    | /patients             | Doctor | Patients who shared records |
| GET    | /shared-records       | Doctor | All shared record links |

### Notifications  — /api/notifications

| Method | Endpoint              | Auth | Description          |
|--------|-----------------------|------|----------------------|
| GET    | /                     | Yes  | Get notifications    |
| PUT    | /read-all             | Yes  | Mark all as read     |
| PUT    | /:id/read             | Yes  | Mark one as read     |

---

## Response Format

All responses follow this shape:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

Errors:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Auth Header

For protected routes, include:
```
Authorization: Bearer <your_jwt_token>
```