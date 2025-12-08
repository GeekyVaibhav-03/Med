# 📚 Complete API Reference - Lab Report & MDR Alert System

## 🔐 Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Lab Report Endpoints

### **POST /api/labreports/upload** ⭐ MAIN ENDPOINT
Upload lab report and trigger MDR detection

**Request:**
```json
{
  "patient_uid": "P001",
  "patient_name": "John Doe",
  "specimen_type": "Blood Culture",
  "organism": "Staphylococcus aureus",
  "antibiotic_profile": {
    "Ampicillin": "R",
    "Amoxicillin": "R",
    "Penicillin": "R",
    "Cephalexin": "R",
    "Ceftriaxone": "R",
    "Ciprofloxacin": "R",
    "Levofloxacin": "R",
    "Vancomycin": "S",
    "Gentamicin": "I",
    "Erythromycin": "R"
  },
  "doctor_name": "Dr. Smith",
  "hospital": "City Hospital"
}
```

**Response (MDR+):**
```json
{
  "ok": true,
  "labReport": {
    "id": 1,
    "patient_uid": "P001",
    "patient_name": "John Doe",
    "organism": "Staphylococcus aureus",
    "is_mdr": true,
    "status": "flagged",
    "created_at": "2025-01-15T10:30:00Z"
  },
  "mdrCase": {
    "id": 1,
    "organism": "Staphylococcus aureus",
    "detected_at": "2025-01-15T10:30:00Z"
  },
  "message": "MDR ALERT: Staphylococcus aureus detected! Alerts sent."
}
```

**Response (Non-MDR):**
```json
{
  "ok": true,
  "labReport": {
    "id": 2,
    "patient_uid": "P002",
    "patient_name": "Jane Smith",
    "organism": "E. coli",
    "is_mdr": false,
    "status": "processed"
  },
  "mdrCase": null,
  "message": "Report processed successfully."
}
```

**Error Response:**
```json
{
  "ok": false,
  "error": "patient_uid and organism are required"
}
```

**HTTP Status Codes:**
- `200 OK` - Report processed
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Invalid/missing token
- `500 Internal Server Error` - Database error

---

### **GET /api/labreports/:patient_uid**
Get all lab reports for a specific patient

**URL:** `GET /api/labreports/P001`

**Response:**
```json
{
  "ok": true,
  "reports": [
    {
      "id": 1,
      "patient_uid": "P001",
      "patient_name": "John Doe",
      "organism": "Staphylococcus aureus",
      "specimen_type": "Blood Culture",
      "is_mdr": true,
      "status": "flagged",
      "antibiotic_profile": {
        "Ampicillin": "R",
        "Ciprofloxacin": "R",
        "Vancomycin": "S"
      },
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

### **GET /api/labreports/mdr/flagged**
Get all MDR-positive (flagged) lab reports

**URL:** `GET /api/labreports/mdr/flagged`

**Query Parameters:**
- `limit` (optional): Max number of reports (default: 50)

**URL with query:** `GET /api/labreports/mdr/flagged?limit=10`

**Response:**
```json
{
  "ok": true,
  "reports": [
    {
      "id": 1,
      "patient_uid": "P001",
      "organism": "MRSA",
      "is_mdr": true,
      "status": "flagged",
      "created_at": "2025-01-15T10:30:00Z"
    },
    {
      "id": 3,
      "patient_uid": "P003",
      "organism": "VRE",
      "is_mdr": true,
      "status": "flagged",
      "created_at": "2025-01-15T10:45:00Z"
    }
  ],
  "count": 2
}
```

---

### **GET /api/labreports/latest/all**
Get latest lab reports across all patients

**URL:** `GET /api/labreports/latest/all?limit=20`

**Query Parameters:**
- `limit` (optional): Max reports to fetch (default: 20, max: 100)

**Response:**
```json
{
  "ok": true,
  "reports": [
    {
      "id": 5,
      "patient_uid": "P005",
      "patient_name": "Michael Brown",
      "organism": "Pseudomonas aeruginosa",
      "is_mdr": true,
      "created_at": "2025-01-15T11:00:00Z"
    },
    {
      "id": 4,
      "patient_uid": "P004",
      "organism": "Salmonella",
      "is_mdr": false,
      "created_at": "2025-01-15T10:50:00Z"
    }
  ],
  "count": 2
}
```

---

## 🔔 Notification Endpoints

### **GET /api/notifications/unread**
Get all unread notifications for current user

**URL:** `GET /api/notifications/unread`

**Response:**
```json
{
  "ok": true,
  "notifications": [
    {
      "id": 1,
      "lab_report_id": 1,
      "mdr_case_id": 1,
      "recipient_role": "doctor",
      "recipient_hospital": "City Hospital",
      "title": "🚨 MDR ALERT: Staphylococcus aureus",
      "message": "Patient P001 (John Doe) tested POSITIVE for Staphylococcus aureus. Immediate isolation protocol required.",
      "severity": "high",
      "is_read": false,
      "created_at": "2025-01-15T10:32:00Z"
    },
    {
      "id": 2,
      "lab_report_id": 1,
      "mdr_case_id": 1,
      "recipient_role": "infection_control",
      "recipient_hospital": "City Hospital",
      "title": "🚨 MDR ALERT: Staphylococcus aureus",
      "message": "Patient P001 (John Doe) tested POSITIVE...",
      "severity": "critical",
      "is_read": false,
      "created_at": "2025-01-15T10:32:00Z"
    }
  ],
  "unreadCount": 2
}
```

---

### **GET /api/notifications/all**
Get all notifications (read + unread) for current user

**URL:** `GET /api/notifications/all?limit=100`

**Query Parameters:**
- `limit` (optional): Max notifications (default: 100)

**Response:**
```json
{
  "ok": true,
  "notifications": [
    {
      "id": 1,
      "is_read": false,
      "severity": "critical",
      ...
    },
    {
      "id": 2,
      "is_read": true,
      "severity": "high",
      ...
    }
  ],
  "count": 2
}
```

---

### **PUT /api/notifications/:id/read**
Mark a notification as read

**URL:** `PUT /api/notifications/1/read`

**Request Body:** (empty)

**Response:**
```json
{
  "ok": true,
  "message": "Marked as read"
}
```

---

### **DELETE /api/notifications/:id**
Delete a notification

**URL:** `DELETE /api/notifications/1`

**Request Body:** (empty)

**Response:**
```json
{
  "ok": true,
  "message": "Notification deleted"
}
```

---

### **DELETE /api/notifications/cleanup/old** (Admin Only)
Delete notifications older than 30 days

**URL:** `DELETE /api/notifications/cleanup/old`

**Response:**
```json
{
  "ok": true,
  "message": "Deleted 45 old notifications",
  "count": 45
}
```

**Error (Non-Admin):**
```json
{
  "ok": false,
  "error": "Admin only"
}
```

---

## 🔌 Socket.io Events (Real-Time)

### **Client → Server**

#### **join_hospital**
Join hospital room to receive targeted alerts
```javascript
socket.emit('join_hospital', {
  hospital: 'City Hospital',
  userRole: 'doctor'
});
```

#### **subscribe_patient**
Subscribe to alerts for a specific patient
```javascript
socket.emit('subscribe_patient', 'P001');
```

---

### **Server → Client**

#### **mdr_alert_notification**
Real-time alert when MDR is detected
```javascript
socket.on('mdr_alert_notification', (data) => {
  console.log('Alert:', {
    type: 'MDR_ALERT',
    severity: 'critical',      // 'low', 'medium', 'high', 'critical'
    patient_uid: 'P001',
    patient_name: 'John Doe',
    organism: 'MRSA',
    hospital: 'City Hospital',
    timestamp: '2025-01-15T10:32:00Z'
  });
});
```

---

## 📋 Known MDR Organisms (Auto-Detected)

```javascript
[
  'MRSA',                           // Methicillin-resistant Staphylococcus aureus
  'VRE',                            // Vancomycin-resistant Enterococcus
  'ESBL',                           // Extended-spectrum beta-lactamase
  'CRE',                            // Carbapenem-resistant Enterobacteriaceae
  'MDR-TB',                         // Multi-drug resistant Tuberculosis
  'XDR-TB',                         // Extensively drug-resistant TB
  'Acinetobacter baumannii',
  'Pseudomonas aeruginosa (resistant)',
  'Clostridium difficile'
]
```

---

## 🧬 Antibiotic Susceptibility Codes

| Code | Meaning |
|------|---------|
| `S` | Susceptible (drug works) |
| `I` | Intermediate (partial resistance) |
| `R` | Resistant (drug doesn't work) |
| `U` | Unknown (not tested) |

---

## 📊 Severity Levels

| Severity | Meaning | Alert Color |
|----------|---------|------------|
| `low` | 1 drug resistant | Yellow |
| `medium` | 2-3 drugs resistant | Orange |
| `high` | 4+ drugs resistant | Red |
| `critical` | 5+ drugs resistant | Dark Red |

---

## 🔑 Authorization Rules

| Endpoint | Required Role | Hospital Scoped |
|----------|---------------|-----------------|
| POST /api/labreports/upload | doctor, admin | ✅ Yes |
| GET /api/labreports/:uid | any | ✅ Yes |
| GET /api/labreports/mdr/flagged | doctor, admin, infection_control | ✅ Yes |
| GET /api/notifications/unread | any | ✅ Yes |
| PUT /api/notifications/:id/read | any | ✅ Yes |
| DELETE /api/notifications/cleanup/old | admin only | ✅ Yes |

---

## 🚨 Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid/missing JWT token |
| 403 | Forbidden | Insufficient permissions (role-based) |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Database or server error |

---

## 💡 Example Workflows

### **Workflow 1: Upload MDR+ Report**
```bash
# 1. Upload report
curl -X POST http://localhost:5000/api/labreports/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_uid": "P001",
    "organism": "MRSA",
    "antibiotic_profile": {
      "Ampicillin": "R",
      "Ciprofloxacin": "R",
      "Vancomycin": "S"
    }
  }'

# 2. Backend:
#    - Saves to LabReport (is_mdr=true)
#    - Creates MdrCase
#    - Sends 3 notifications
#    - Broadcasts Socket.io alert

# 3. Frontend:
#    - Shows MDRAlertBanner
#    - Displays toast notification
#    - Lists report with red badge
```

### **Workflow 2: Check Unread Alerts**
```bash
# 1. Fetch unread notifications
curl -X GET http://localhost:5000/api/notifications/unread \
  -H "Authorization: Bearer <TOKEN>"

# 2. Response shows unread alert count

# 3. Mark first notification as read
curl -X PUT http://localhost:5000/api/notifications/1/read \
  -H "Authorization: Bearer <TOKEN>"
```

### **Workflow 3: Get All MDR Cases**
```bash
# 1. Fetch flagged reports
curl -X GET http://localhost:5000/api/labreports/mdr/flagged?limit=10 \
  -H "Authorization: Bearer <TOKEN>"

# 2. Response shows all MDR+ reports
# 3. Filter by organism, hospital, date as needed
```

---

## 🧪 Test with Postman/cURL

### **Setup for Postman:**
1. Get JWT token by logging in
2. Create Environment Variable: `{{token}}`
3. Add to request header: `Authorization: Bearer {{token}}`
4. Test endpoints

### **cURL Template:**
```bash
curl -X POST http://localhost:5000/api/labreports/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"patient_uid":"P001","organism":"MRSA",...}'
```

---

**This API is production-ready and fully documented! 🚀**
