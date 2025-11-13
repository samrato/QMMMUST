# QMMUST Gate Pass System - API Documentation

## Overview

Complete API reference for the QMMUST Gate Pass System backend. All endpoints (except `/api/auth/login` and `/api/gate/scan`) require JWT authentication via the `Authorization` header.

## Base URL

\`\`\`
https://your-domain.com/api
\`\`\`

## Authentication

All protected endpoints require:

\`\`\`
Authorization: Bearer {jwt_token}
\`\`\`

### Token Structure

\`\`\`json
{
  "sub": "user_id",
  "registrationNumber": "CS/2021/001",
  "role": "student" | "admin",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234671890
}
\`\`\`

---

## Authentication Endpoints

### Login

**Endpoint:** `POST /auth/login`

**Authentication:** None (Public)

**Request:**
\`\`\`json
{
  "registrationNumber": "CS/2021/001",
  "password": "student123"
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "student",
  "user": {
    "id": "uuid",
    "name": "John Mutua",
    "email": "john@example.com",
    "registrationNumber": "CS/2021/001"
  }
}
\`\`\`

**Response (Error):**
\`\`\`json
{
  "error": "Invalid credentials"
}
\`\`\`

**Status Codes:** 200, 400, 401

---

## Student Endpoints

### Get Student Profile

**Endpoint:** `GET /student/profile`

**Authentication:** Required (Student)

**Response:**
\`\`\`json
{
  "user": {
    "id": "uuid",
    "name": "John Mutua",
    "email": "john@example.com",
    "registration_number": "CS/2021/001",
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

### Update Student Profile

**Endpoint:** `PUT /student/profile`

**Authentication:** Required (Student)

**Request:**
\`\`\`json
{
  "name": "John Updated",
  "email": "newemail@example.com"
}
\`\`\`

**Response:** Returns updated user object

---

### Get Student Devices

**Endpoint:** `GET /student/devices`

**Authentication:** Required (Student)

**Response:**
\`\`\`json
{
  "devices": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "rfid_tag": "RFID001A",
      "device_name": "Dell Inspiron 15",
      "device_type": "Laptop",
      "is_registered": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

### Register New Device

**Endpoint:** `POST /student/devices`

**Authentication:** Required (Student)

**Request:**
\`\`\`json
{
  "rfid_tag": "RFID002B",
  "device_name": "HP Pavilion",
  "device_type": "Laptop"
}
\`\`\`

**Response:** Returns new device object with 201 status

---

### Generate Gate Pass (QR + PIN)

**Endpoint:** `POST /student/generate-pass`

**Authentication:** Required (Student)

**Request:**
\`\`\`json
{
  "device_id": "uuid"
}
\`\`\`

**Response:**
\`\`\`json
{
  "gatePass": {
    "id": "uuid",
    "student_id": "uuid",
    "device_id": "uuid",
    "qr_code": "data:image/png;base64,...",
    "pin": "123456",
    "expires_at": "2024-01-02T00:00:00Z",
    "is_used": false,
    "generated_at": "2024-01-01T00:00:00Z"
  }
}
\`\`\`

---

### Get Movement Logs

**Endpoint:** `GET /student/movements`

**Authentication:** Required (Student)

**Query Parameters:**
- `status` (optional): "approved" | "denied" | "pending"
- `limit` (optional): Default 50, max 100

**Response:**
\`\`\`json
{
  "movements": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "device_id": "uuid",
      "rfid_tag": "RFID001A",
      "gate_name": "Main Gate",
      "gate_direction": "exit",
      "status": "approved",
      "reason": null,
      "created_at": "2024-01-01T10:30:00Z"
    }
  ]
}
\`\`\`

---

## Admin Endpoints

### Get Dashboard Statistics

**Endpoint:** `GET /admin/dashboard`

**Authentication:** Required (Admin)

**Response:**
\`\`\`json
{
  "stats": {
    "totalStudents": 150,
    "registeredAssets": 280,
    "gatePassLogs": 5420,
    "suspiciousAttempts": 12
  },
  "recentMovements": [...],
  "recentAlerts": [...]
}
\`\`\`

---

### Get All Students

**Endpoint:** `GET /admin/students`

**Authentication:** Required (Admin)

**Query Parameters:**
- `search` (optional): Search by name or registration number
- `limit` (optional): Default 100
- `offset` (optional): Default 0

**Response:**
\`\`\`json
{
  "students": [
    {
      "id": "uuid",
      "name": "John Mutua",
      "email": "john@example.com",
      "registration_number": "CS/2021/001",
      "is_active": true,
      "last_login": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

---

### Get Student Details

**Endpoint:** `GET /admin/students/{id}`

**Authentication:** Required (Admin)

**Response:**
\`\`\`json
{
  "student": {...},
  "devices": [...],
  "movements": [...]
}
\`\`\`

---

### Update Student Status

**Endpoint:** `PUT /admin/students/{id}`

**Authentication:** Required (Admin)

**Request:**
\`\`\`json
{
  "is_active": false
}
\`\`\`

**Response:** Returns updated student object

---

### Get Asset Logs

**Endpoint:** `GET /admin/logs`

**Authentication:** Required (Admin)

**Query Parameters:**
- `status` (optional): "approved" | "denied" | "pending"
- `date_from` (optional): ISO date string
- `date_to` (optional): ISO date string
- `limit` (optional): Default 100

**Response:**
\`\`\`json
{
  "logs": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "device_id": "uuid",
      "rfid_tag": "RFID001A",
      "gate_name": "Main Gate",
      "gate_direction": "exit",
      "status": "approved",
      "users": {
        "name": "John Mutua",
        "registration_number": "CS/2021/001"
      },
      "devices": {
        "device_name": "Dell Inspiron",
        "rfid_tag": "RFID001A"
      },
      "created_at": "2024-01-01T10:30:00Z"
    }
  ]
}
\`\`\`

---

### Get Alerts & Notifications

**Endpoint:** `GET /admin/alerts`

**Authentication:** Required (Admin)

**Response:**
\`\`\`json
{
  "alerts": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "device_id": "uuid",
      "alert_type": "device_exit",
      "message": "Your device has exited...",
      "recipient_email": "john@example.com",
      "is_sent": true,
      "sent_at": "2024-01-01T10:30:00Z",
      "created_at": "2024-01-01T10:30:00Z"
    }
  ]
}
\`\`\`

---

## IoT Gate Scanner Endpoints

### Gate Scan (RFID + PIN Verification)

**Endpoint:** `POST /gate/scan`

**Authentication:** None (API Key based in production)

**Request:**
\`\`\`json
{
  "rfid_tag": "RFID001A",
  "pin": "123456",
  "gate_name": "Main Gate",
  "gate_direction": "exit"
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "status": "approved",
  "message": "Device verified",
  "student": {
    "name": "John Mutua",
    "email": "john@example.com"
  },
  "notification_sent": true
}
\`\`\`

**Response (Failed):**
\`\`\`json
{
  "status": "denied",
  "message": "Invalid PIN"
}
\`\`\`

---

## Notification Endpoints

### Send Email Notification

**Endpoint:** `POST /notifications/send-email`

**Authentication:** Required (Admin)

**Request:**
\`\`\`json
{
  "alert_id": "uuid",
  "email": "student@example.com",
  "subject": "QMMUST Gate Alert",
  "message": "Your device has exited..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "email_id": "msg_1704110400000"
}
\`\`\`

---

## Error Responses

All errors follow this format:

\`\`\`json
{
  "error": "Error message description"
}
\`\`\`

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (Missing/Invalid token) |
| 403 | Forbidden (Insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

- 100 requests per minute for authenticated endpoints
- 10 requests per minute for public endpoints (login, gate scan)

---

## Realtime Subscriptions

Subscribe to live updates using Supabase Realtime:

\`\`\`typescript
const channel = supabase.channel('movements')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'movements'
  }, (payload) => {
    console.log('New movement:', payload)
  })
  .subscribe()
\`\`\`

---

## Environment Variables Required

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SECRET=your-jwt-secret-key
\`\`\`

---

## Testing Credentials

**Admin Account:**
- Registration: `ADMIN001`
- Password: `admin123`

**Student Account:**
- Registration: `CS/2021/001`
- Password: `student123`

---

## Support

For API issues or questions, contact: support@qmmust.ac.ke
