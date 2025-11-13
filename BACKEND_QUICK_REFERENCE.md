# Backend Quick Reference Guide

## Essential Endpoints Summary

| Method | Endpoint | Purpose | Request Body |
|--------|----------|---------|--------------|
| GET | `/api/v1/tasks` | Get all tasks | - |
| GET | `/api/v1/tasks/:id` | Get single task | - |
| POST | `/api/v1/tasks` | Create task | `{title, description?}` |
| PATCH | `/api/v1/tasks/:id` | Update task | `{title?, description?}` |
| DELETE | `/api/v1/tasks/:id` | Delete task | - |
| PATCH | `/api/v1/tasks/:id/toggle` | Toggle completion | - |

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
  "completed": false,
  "createdAt": "2025-11-13T10:30:00.000Z",
  "updatedAt": "2025-11-13T10:30:00.000Z"
}
```

## Database Schema

```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Validation Rules

- **title**: Required, non-empty string, max 255 characters
- **description**: Optional, text field
- **completed**: Boolean, default false

## HTTP Status Codes

- `200` - Success (GET, PATCH, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Server Error

## CORS Configuration

Allow requests from: `http://localhost:3000`

## Testing with cURL

```bash
# Get all tasks
curl http://localhost:3001/api/v1/tasks

# Create task
curl -X POST http://localhost:3001/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Description"}'

# Update task
curl -X PATCH http://localhost:3001/api/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# Toggle completion
curl -X PATCH http://localhost:3001/api/v1/tasks/1/toggle

# Delete task
curl -X DELETE http://localhost:3001/api/v1/tasks/1
```

For detailed documentation, see `BACKEND_API_DOCUMENTATION.md`

