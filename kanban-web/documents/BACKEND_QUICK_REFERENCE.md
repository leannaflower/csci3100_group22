# Backend Quick Reference Guide

## Base URL
```
http://8.217.112.161:8000
```

## Authentication Endpoints

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|---------------|
| POST | `/auth/register` | Register user | `{username, email, password}` |
| POST | `/auth/login` | Login user | `{username, password}` |
| POST | `/auth/refresh` | Refresh token | `{refresh_token}` |
| GET | `/users/me` | Get current user | - (requires Bearer token) |

## Task Management Endpoints

| Method | Endpoint | Purpose | Request Body | Auth Required |
|--------|----------|---------|---------------|---------------|
| GET | `/api/v1/tasks` | Get all tasks | - | Yes |
| GET | `/api/v1/tasks/:id` | Get single task | - | Yes |
| POST | `/api/v1/tasks` | Create task | `{title, description?, column?}` | Yes |
| PATCH | `/api/v1/tasks/:id` | Update task | `{title?, description?, column?, completed?}` | Yes |
| DELETE | `/api/v1/tasks/:id` | Delete task | - | Yes |
| PATCH | `/api/v1/tasks/:id/toggle` | Toggle completion | - | Yes |
| PATCH | `/api/v1/tasks/:id/move` | Move to column | `{column}` | Yes |

## Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## Task Object Structure

```json
{
  "id": "1",
  "title": "Task title",
  "description": "Task description",
  "column": "To Do",
  "completed": false,
  "createdAt": "2025-11-13T10:30:00.000Z",
  "updatedAt": "2025-11-13T10:30:00.000Z"
}
```

**Column Values:** "To Do", "Doing", "Done"

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  column_name VARCHAR(50) NOT NULL DEFAULT 'To Do',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (column_name IN ('To Do', 'Doing', 'Done'))
);
```

## Validation Rules

- **title**: Required, non-empty string, max 255 characters
- **description**: Optional, text field
- **column**: Required, must be "To Do", "Doing", or "Done" (default: "To Do")
- **completed**: Boolean, automatically set to true when column is "Done"

## HTTP Status Codes

- `200` - Success (GET, PATCH, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Server Error

## Authentication

All task endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## CORS Configuration

Allow requests from: `http://localhost:3000` and `http://8.217.112.161:3000`

## Testing with cURL

**Authentication:**
```bash
# Register
curl -X POST http://8.217.112.161:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user","email":"user@example.com","password":"pass"}'

# Login (save the access_token from response)
curl -X POST http://8.217.112.161:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'
```

**Tasks (replace TOKEN with actual token):**
```bash
# Get all tasks
curl http://8.217.112.161:8000/api/v1/tasks \
  -H "Authorization: Bearer TOKEN"

# Create task
curl -X POST http://8.217.112.161:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"My Task","description":"Description","column":"To Do"}'

# Update task
curl -X PATCH http://8.217.112.161:8000/api/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Updated Title","column":"Doing"}'

# Move task
curl -X PATCH http://8.217.112.161:8000/api/v1/tasks/1/move \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"column":"Done"}'

# Toggle completion
curl -X PATCH http://8.217.112.161:8000/api/v1/tasks/1/toggle \
  -H "Authorization: Bearer TOKEN"

# Delete task
curl -X DELETE http://8.217.112.161:8000/api/v1/tasks/1 \
  -H "Authorization: Bearer TOKEN"
```

For detailed documentation, see `BACKEND_API_DOCUMENTATION.md`

