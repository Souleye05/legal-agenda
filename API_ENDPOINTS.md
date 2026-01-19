# 📡 API Endpoints - Legal Agenda

Base URL: `http://localhost:3001/api`

## 🔐 Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "ADMIN" | "COLLABORATOR"  // optional, default: COLLABORATOR
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "ADMIN"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "ADMIN"
  }
}
```

---

## 👥 Users

**All endpoints require JWT token in header:**
```
Authorization: Bearer <token>
```

### Get all users
```http
GET /users

Response: 200 OK
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2026-01-19T10:00:00.000Z"
  }
]
```

### Get user by ID
```http
GET /users/:id

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "ADMIN",
  "isActive": true,
  "createdAt": "2026-01-19T10:00:00.000Z"
}
```

### Update user
```http
PATCH /users/:id
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "isActive": false
}

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "Jane Doe",
  "role": "ADMIN",
  "isActive": false
}
```

---

## 📁 Cases (Affaires)

### Get all cases
```http
GET /cases
GET /cases?status=ACTIVE

Response: 200 OK
[
  {
    "id": "uuid",
    "reference": "AFF-2026-0001",
    "title": "Dupont c/ Martin - Expulsion",
    "jurisdiction": "Tribunal Judiciaire",
    "chamber": "Chambre civile",
    "city": "Paris",
    "status": "ACTIVE",
    "observations": "Affaire urgente",
    "createdAt": "2026-01-19T10:00:00.000Z",
    "updatedAt": "2026-01-19T10:00:00.000Z",
    "parties": [
      {
        "id": "uuid",
        "name": "Société Dupont SARL",
        "role": "DEMANDEUR"
      }
    ],
    "hearings": [...],
    "createdBy": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "user@example.com"
    }
  }
]
```

### Get case by ID
```http
GET /cases/:id

Response: 200 OK
{
  "id": "uuid",
  "reference": "AFF-2026-0001",
  "title": "Dupont c/ Martin - Expulsion",
  "jurisdiction": "Tribunal Judiciaire",
  "chamber": "Chambre civile",
  "city": "Paris",
  "status": "ACTIVE",
  "observations": "Affaire urgente",
  "parties": [...],
  "hearings": [...],
  "createdBy": {...}
}
```

### Get case statistics
```http
GET /cases/stats

Response: 200 OK
{
  "activeCases": 15,
  "closedCases": 8,
  "radiatedCases": 3,
  "totalCases": 26
}
```

### Create case
```http
POST /cases
Content-Type: application/json

{
  "title": "Dupont c/ Martin - Expulsion",
  "parties": [
    {
      "name": "Société Dupont SARL",
      "role": "DEMANDEUR"
    },
    {
      "name": "M. Jean Martin",
      "role": "DEFENDEUR"
    }
  ],
  "jurisdiction": "Tribunal Judiciaire",
  "chamber": "Chambre civile",
  "city": "Paris",
  "observations": "Affaire urgente"
}

Response: 201 Created
{
  "id": "uuid",
  "reference": "AFF-2026-0001",  // Auto-generated
  "title": "Dupont c/ Martin - Expulsion",
  ...
}
```

### Update case
```http
PATCH /cases/:id
Content-Type: application/json

{
  "title": "Updated title",
  "status": "CLOTUREE",
  "observations": "Updated notes"
}

Response: 200 OK
{
  "id": "uuid",
  "reference": "AFF-2026-0001",
  "title": "Updated title",
  ...
}
```

### Delete case
```http
DELETE /cases/:id

Response: 200 OK
{
  "message": "Case deleted successfully"
}
```

---

## 📅 Hearings (Audiences)

### Get all hearings
```http
GET /hearings
GET /hearings?status=A_VENIR
GET /hearings?caseId=uuid

Response: 200 OK
[
  {
    "id": "uuid",
    "date": "2026-01-20T00:00:00.000Z",
    "time": "09:30",
    "type": "MISE_EN_ETAT",
    "status": "A_VENIR",
    "preparationNotes": "Vérifier échange des conclusions",
    "isPrepared": false,
    "caseId": "uuid",
    "case": {
      "id": "uuid",
      "reference": "AFF-2026-0001",
      "title": "Dupont c/ Martin - Expulsion",
      "parties": [...]
    },
    "result": null,
    "createdBy": {...}
  }
]
```

### Get unreported hearings
```http
GET /hearings/unreported

Response: 200 OK
[
  {
    "id": "uuid",
    "date": "2026-01-17T00:00:00.000Z",
    "status": "NON_RENSEIGNEE",
    "case": {...}
  }
]
```

### Get tomorrow's hearings
```http
GET /hearings/tomorrow

Response: 200 OK
[
  {
    "id": "uuid",
    "date": "2026-01-20T00:00:00.000Z",
    "time": "09:30",
    "case": {...}
  }
]
```

### Get calendar
```http
GET /hearings/calendar
GET /hearings/calendar?month=1&year=2026

Response: 200 OK
[
  {
    "id": "uuid",
    "date": "2026-01-20T00:00:00.000Z",
    "time": "09:30",
    "type": "MISE_EN_ETAT",
    "status": "A_VENIR",
    "case": {...},
    "result": null
  }
]
```

### Get hearing by ID
```http
GET /hearings/:id

Response: 200 OK
{
  "id": "uuid",
  "date": "2026-01-20T00:00:00.000Z",
  "time": "09:30",
  "type": "MISE_EN_ETAT",
  "status": "A_VENIR",
  "preparationNotes": "...",
  "case": {...},
  "result": null
}
```

### Create hearing
```http
POST /hearings
Content-Type: application/json

{
  "caseId": "uuid",
  "date": "2026-01-20",
  "time": "09:30",
  "type": "MISE_EN_ETAT",
  "preparationNotes": "Vérifier échange des conclusions"
}

Response: 201 Created
{
  "id": "uuid",
  "date": "2026-01-20T00:00:00.000Z",
  "time": "09:30",
  "type": "MISE_EN_ETAT",
  "status": "A_VENIR",
  ...
}
```

### Update hearing
```http
PATCH /hearings/:id
Content-Type: application/json

{
  "date": "2026-01-21",
  "time": "10:00",
  "preparationNotes": "Updated notes",
  "isPrepared": true
}

Response: 200 OK
{
  "id": "uuid",
  "date": "2026-01-21T00:00:00.000Z",
  "time": "10:00",
  ...
}
```

### Record hearing result
```http
POST /hearings/:id/result
Content-Type: application/json

// RENVOI
{
  "type": "RENVOI",
  "newDate": "2026-02-15",
  "postponementReason": "Conclusions non échangées"
}

// RADIATION
{
  "type": "RADIATION",
  "radiationReason": "Désistement du demandeur"
}

// DELIBERE
{
  "type": "DELIBERE",
  "deliberationText": "Jugement rendu en faveur du demandeur. Condamnation du défendeur..."
}

Response: 201 Created
{
  "id": "uuid",
  "type": "RENVOI",
  "newDate": "2026-02-15T00:00:00.000Z",
  "postponementReason": "Conclusions non échangées",
  "hearingId": "uuid",
  "createdAt": "2026-01-19T10:00:00.000Z"
}

// Side effects:
// - Hearing status updated to TENUE
// - RENVOI: New hearing created automatically
// - RADIATION: Case status updated to RADIEE
// - DELIBERE: Case status updated to CLOTUREE
// - All alerts for this hearing resolved
```

### Delete hearing
```http
DELETE /hearings/:id

Response: 200 OK
{
  "message": "Hearing deleted successfully"
}
```

---

## 📋 Audit Logs

### Get all audit logs
```http
GET /audit
GET /audit?limit=50

Response: 200 OK
[
  {
    "id": "uuid",
    "entityType": "Case",
    "entityId": "uuid",
    "action": "CREATE",
    "oldValue": null,
    "newValue": "{...}",
    "createdAt": "2026-01-19T10:00:00.000Z",
    "user": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "user@example.com"
    }
  }
]
```

### Get audit logs for entity
```http
GET /audit/entity?type=Case&id=uuid

Response: 200 OK
[
  {
    "id": "uuid",
    "entityType": "Case",
    "entityId": "uuid",
    "action": "UPDATE",
    "oldValue": "{...}",
    "newValue": "{...}",
    "createdAt": "2026-01-19T10:00:00.000Z",
    "user": {...}
  }
]
```

---

## 📊 Enums

### UserRole
- `ADMIN`
- `COLLABORATOR`

### CaseStatus
- `ACTIVE`
- `CLOTUREE`
- `RADIEE`

### PartyRole
- `DEMANDEUR`
- `DEFENDEUR`
- `CONSEIL_ADVERSE`

### HearingStatus
- `A_VENIR`
- `TENUE`
- `NON_RENSEIGNEE`

### HearingType
- `MISE_EN_ETAT`
- `PLAIDOIRIE`
- `REFERE`
- `EVOCATION`
- `CONCILIATION`
- `MEDIATION`
- `AUTRE`

### HearingResultType
- `RENVOI`
- `RADIATION`
- `DELIBERE`

### AuditAction
- `CREATE`
- `UPDATE`
- `DELETE`

---

## 🔒 Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Case not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@legalagenda.com","password":"admin123"}'
```

### Get cases (with auth)
```bash
TOKEN="your-jwt-token"

curl -X GET http://localhost:3001/api/cases \
  -H "Authorization: Bearer $TOKEN"
```

### Create case
```bash
curl -X POST http://localhost:3001/api/cases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test c/ Test - Litige",
    "parties": [
      {"name": "Demandeur Test", "role": "DEMANDEUR"},
      {"name": "Défendeur Test", "role": "DEFENDEUR"}
    ],
    "jurisdiction": "Tribunal Judiciaire",
    "chamber": "Chambre civile"
  }'
```

---

## 📝 Notes

- Tous les endpoints (sauf `/auth/login` et `/auth/register`) nécessitent un JWT token
- Les dates sont au format ISO 8601 : `YYYY-MM-DD` ou `YYYY-MM-DDTHH:mm:ss.sssZ`
- Les IDs sont des UUIDs v4
- Les références d'affaires sont auto-générées : `AFF-YYYY-NNNN`
- Le système d'alertes fonctionne automatiquement en arrière-plan
