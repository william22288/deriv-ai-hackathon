# Backend Endpoints Reference

This document provides a comprehensive list of all available backend endpoints.

## Base URL
```
http://localhost:3000/api
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints by Module

### Auth Module (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout user | Yes |
| GET | `/auth/me` | Get current user profile | Yes |

### Employees Module (`/employees`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|----------------|---------------|
| GET | `/employees` | Get all employees | Yes | HR_ADMIN, SUPER_ADMIN |
| GET | `/employees/:id` | Get specific employee | Yes | - |
| POST | `/employees` | Create employee | Yes | HR_ADMIN, SUPER_ADMIN |
| PUT | `/employees/:id` | Update employee | Yes | HR_ADMIN, SUPER_ADMIN |
| GET | `/employees/:id/team` | Get employee's team | Yes | - |

### Documents Module (`/documents`)

#### Templates
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|----------------|---------------|
| GET | `/documents/templates` | Get all templates | Yes | - |
| GET | `/documents/templates/:id` | Get specific template | Yes | - |
| POST | `/documents/templates` | Create template | Yes | HR_ADMIN, SUPER_ADMIN |
| PUT | `/documents/templates/:id` | Update template | Yes | HR_ADMIN, SUPER_ADMIN |

#### Contracts
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|----------------|---------------|
| POST | `/documents/contracts/generate` | Generate contract | Yes | - |
| GET | `/documents/contracts` | Get all contracts | Yes | - |
| GET | `/documents/contracts/:id` | Get specific contract | Yes | - |
| GET | `/documents/contracts/:id/versions` | Get contract versions | Yes | - |
| GET | `/documents/contracts/:id/download` | Download contract | Yes | - |
| POST | `/documents/contracts/:id/sign` | Sign contract | Yes | - |

#### Equity
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|----------------|---------------|
| POST | `/documents/equity/generate` | Generate equity docs | Yes | HR_ADMIN, SUPER_ADMIN |
| GET | `/documents/equity/:employeeId` | Get employee equity | Yes | - |

### Chat Module (`/chat`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|----------------|---------------|
| POST | `/chat/sessions` | Create chat session | Yes | - |
| GET | `/chat/sessions` | Get all sessions | Yes | - |
| GET | `/chat/sessions/:id` | Get specific session | Yes | - |
| POST | `/chat/sessions/:id/messages` | Send message | Yes | - |
| DELETE | `/chat/sessions/:id` | Delete session | Yes | - |

### Policies Module (`/policies`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|----------------|---------------|
| GET | `/policies` | Get all policies | Yes | - |
| GET | `/policies/:id` | Get specific policy | Yes | - |
| POST | `/policies` | Create policy | Yes | HR_ADMIN, SUPER_ADMIN |
| PUT | `/policies/:id` | Update policy | Yes | HR_ADMIN, SUPER_ADMIN |
| POST | `/policies/search` | Search policies | Yes | - |

### Laws Module (`/laws`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|----------------|---------------|
| GET | `/laws` | Get all laws | Yes | - |
| GET | `/laws/:jurisdiction` | Get laws by jurisdiction | Yes | - |
| GET | `/laws/:jurisdiction/:category` | Get laws by category | Yes | - |

### Requests Module (`/requests`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|----------------|---------------|
| POST | `/requests` | Create request | Yes | - |
| GET | `/requests` | Get all requests | Yes | - |
| GET | `/requests/:id` | Get specific request | Yes | - |
| PATCH | `/requests/:id` | Update request | Yes | - |
| POST | `/requests/:id/assign` | Assign request | Yes | HR_ADMIN, MANAGER |
| POST | `/requests/:id/approve` | Approve request | Yes | HR_ADMIN, MANAGER |
| POST | `/requests/:id/reject` | Reject request | Yes | HR_ADMIN, MANAGER |

### Compliance Module (`/compliance`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|----------------|---------------|
| GET | `/compliance/items` | Get all compliance items | Yes | - |
| GET | `/compliance/items/:id` | Get specific item | Yes | - |
| POST | `/compliance/items` | Create item | Yes | HR_ADMIN, SUPER_ADMIN |
| PUT | `/compliance/items/:id` | Update item | Yes | HR_ADMIN, SUPER_ADMIN |
| DELETE | `/compliance/items/:id` | Delete item | Yes | HR_ADMIN, SUPER_ADMIN |
| GET | `/compliance/expiring` | Get expiring items | Yes | - |
| GET | `/compliance/dashboard` | Get compliance dashboard | Yes | HR_ADMIN, SUPER_ADMIN |
| POST | `/compliance/reports/generate` | Generate report | Yes | HR_ADMIN, SUPER_ADMIN |

### Training Module (`/training`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|----------------|---------------|
| GET | `/training/programs` | Get all programs | Yes | - |
| GET | `/training/programs/:id` | Get specific program | Yes | - |
| POST | `/training/programs` | Create program | Yes | HR_ADMIN, SUPER_ADMIN |
| PUT | `/training/programs/:id` | Update program | Yes | HR_ADMIN, SUPER_ADMIN |
| GET | `/training/assignments` | Get all assignments | Yes | - |
| POST | `/training/assignments` | Create assignment | Yes | HR_ADMIN, SUPER_ADMIN |
| POST | `/training/assignments/:id/complete` | Complete assignment | Yes | - |
| GET | `/training/overdue` | Get overdue training | Yes | HR_ADMIN, SUPER_ADMIN |

## Request/Response Examples

### Register User
```json
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Create Employee
```json
POST /employees
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "department": "Engineering",
  "position": "Senior Developer",
  "jobTitle": "Senior Software Engineer",
  "reportingManager": "manager-id"
}

Response:
{
  "id": "emp-456",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "department": "Engineering",
  "createdAt": "2026-02-07T00:00:00Z"
}
```

### Generate Contract
```json
POST /documents/contracts/generate
{
  "employeeName": "John Doe",
  "position": "Senior Engineer",
  "jurisdiction": "US-CA",
  "startDate": "2026-03-01",
  "salary": "150000",
  "workLocation": "Remote",
  "additionalClauses": "Optional terms..."
}

Response:
{
  "id": "contract-789",
  "contractNumber": "CTR-2026-001",
  "employeeName": "John Doe",
  "jurisdiction": "US-CA",
  "status": "generated",
  "content": "...",
  "generatedAt": "2026-02-07T12:00:00Z"
}
```

### Create Chat Session
```json
POST /chat/sessions

Response:
{
  "id": "session-123",
  "createdAt": "2026-02-07T00:00:00Z",
  "messages": []
}
```

### Send Chat Message
```json
POST /chat/sessions/session-123/messages
{
  "message": "What is the PTO policy?"
}

Response:
{
  "id": "msg-456",
  "role": "assistant",
  "content": "The PTO policy allows employees to take...",
  "timestamp": "2026-02-07T12:05:00Z"
}
```

### Create Request
```json
POST /requests
{
  "type": "time-off",
  "startDate": "2026-03-15",
  "endDate": "2026-03-17",
  "reason": "Personal leave"
}

Response:
{
  "id": "req-789",
  "type": "time-off",
  "status": "pending",
  "startDate": "2026-03-15",
  "endDate": "2026-03-17",
  "createdAt": "2026-02-07T00:00:00Z"
}
```

## Error Responses

All endpoints return error messages in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Role-Based Access Control

The API enforces role-based access control. Available roles:

- `EMPLOYEE`: Basic user role
- `MANAGER`: Can manage subordinates
- `HR_ADMIN`: Can manage employees and HR functions
- `SUPER_ADMIN`: Full access to all endpoints

## Rate Limiting

Currently, there is no rate limiting implemented. Production deployments should implement appropriate rate limiting.

## CORS

The backend is configured to accept requests from:
- `http://localhost:5173` (local frontend development)
- `http://localhost:3000` (for testing)
- Other origins can be configured in the backend `.env` file
