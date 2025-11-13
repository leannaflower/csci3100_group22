# Backend API Documentation for Task Management System

## Overview

This document provides specifications for building the backend API to support the Task Management web frontend. The frontend is built with React and currently uses localStorage. The backend should replace this with a RESTful API using MySQL database.

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Data Models](#data-models)
3. [Request/Response Formats](#requestresponse-formats)
4. [Error Handling](#error-handling)
5. [Database Schema](#database-schema)
6. [Integration Guide](#integration-guide)
7. [Authentication (Optional)](#authentication-optional)

---

## API Endpoints

### Base URL
```
http://localhost:3001/api/v1
```
*(Adjust port as needed)*

### Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks` | Get all tasks | Optional |
| GET | `/tasks/:id` | Get a single task | Optional |
| POST | `/tasks` | Create a new task | Optional |
| PATCH | `/tasks/:id` | Update a task | Optional |
| DELETE | `/tasks/:id` | Delete a task | Optional |
| PATCH | `/tasks/:id/toggle` | Toggle task completion | Optional |

---

## Detailed Endpoint Specifications

### 1. GET /api/v1/tasks

**Description:** Retrieve all tasks

**Request:**
```
GET /api/v1/tasks
Headers:
  Content-Type: application/json
  Authorization: Bearer <token> (if authentication is implemented)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Complete project documentation",
      "description": "Write API documentation for backend",
      "completed": false,
      "createdAt": "2025-11-13T10:30:00.000Z",
      "updatedAt": "2025-11-13T10:30:00.000Z"
    },
    {
      "id": "2",
      "title": "Review code",
      "description": "",
      "completed": true,
      "createdAt": "2025-11-13T09:00:00.000Z",
      "updatedAt": "2025-11-13T11:00:00.000Z"
    }
  ],
  "count": 2
}
```

**Query Parameters (Optional):**
- `completed` (boolean): Filter by completion status
  - Example: `/api/v1/tasks?completed=false`

---

### 2. GET /api/v1/tasks/:id

**Description:** Retrieve a single task by ID

**Request:**
```
GET /api/v1/tasks/1
Headers:
  Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Complete project documentation",
    "description": "Write API documentation for backend",
    "completed": false,
    "createdAt": "2025-11-13T10:30:00.000Z",
    "updatedAt": "2025-11-13T10:30:00.000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Task not found",
    "code": "TASK_NOT_FOUND"
  }
}
```

---

### 3. POST /api/v1/tasks

**Description:** Create a new task

**Request:**
```
POST /api/v1/tasks
Headers:
  Content-Type: application/json
Body:
{
  "title": "New task title",
  "description": "Optional task description"
}
```

**Request Body Schema:**
- `title` (string, required): Task title (max 255 characters)
- `description` (string, optional): Task description (text)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "3",
    "title": "New task title",
    "description": "Optional task description",
    "completed": false,
    "createdAt": "2025-11-13T12:00:00.000Z",
    "updatedAt": "2025-11-13T12:00:00.000Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "code": "VALIDATION_ERROR",
    "details": {
      "title": "Title is required"
    }
  }
}
```

---

### 4. PATCH /api/v1/tasks/:id

**Description:** Update an existing task

**Request:**
```
PATCH /api/v1/tasks/1
Headers:
  Content-Type: application/json
Body:
{
  "title": "Updated task title",
  "description": "Updated description"
}
```

**Request Body Schema:**
- `title` (string, optional): Updated task title
- `description` (string, optional): Updated task description
- Note: Both fields are optional, but at least one should be provided

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "1",
    "title": "Updated task title",
    "description": "Updated description",
    "completed": false,
    "createdAt": "2025-11-13T10:30:00.000Z",
    "updatedAt": "2025-11-13T12:15:00.000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Task not found",
    "code": "TASK_NOT_FOUND"
  }
}
```

---

### 5. DELETE /api/v1/tasks/:id

**Description:** Delete a task

**Request:**
```
DELETE /api/v1/tasks/1
Headers:
  Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "message": "Task not found",
    "code": "TASK_NOT_FOUND"
  }
}
```

---

### 6. PATCH /api/v1/tasks/:id/toggle

**Description:** Toggle task completion status

**Request:**
```
PATCH /api/v1/tasks/1/toggle
Headers:
  Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task status updated",
  "data": {
    "id": "1",
    "title": "Complete project documentation",
    "description": "Write API documentation for backend",
    "completed": true,
    "createdAt": "2025-11-13T10:30:00.000Z",
    "updatedAt": "2025-11-13T12:20:00.000Z"
  }
}
```

**Alternative:** You can also use the main PATCH endpoint with `completed` field:
```
PATCH /api/v1/tasks/1
Body: { "completed": true }
```

---

## Data Models

### Task Object

```typescript
interface Task {
  id: string | number;           // Unique identifier
  title: string;                  // Task title (required, max 255 chars)
  description: string;            // Task description (optional, text)
  completed: boolean;             // Completion status (default: false)
  createdAt: string;              // ISO 8601 timestamp
  updatedAt: string;              // ISO 8601 timestamp
}
```

### Request/Response Wrapper

All responses should follow this structure:

```typescript
interface SuccessResponse<T> {
  success: true;
  data?: T;
  message?: string;
  count?: number;
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, any>;
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Status Code | Description | When to Use |
|-------------|-------------|-------------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side errors |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {
      "field": "Specific field error message"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `TASK_NOT_FOUND` - Task with given ID doesn't exist
- `DATABASE_ERROR` - Database operation failed
- `UNAUTHORIZED` - Authentication required
- `INTERNAL_ERROR` - Unexpected server error

---

## Database Schema

### MySQL Table: `tasks`

```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_completed (completed),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Optional: User Association (if authentication is added)

```sql
ALTER TABLE tasks 
ADD COLUMN user_id INT,
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD INDEX idx_user_id (user_id);
```

---

## Integration Guide

### Step 1: Update Frontend to Use API

The frontend currently uses localStorage. To connect to the backend, you'll need to:

1. **Create an API service file** (`src/services/api.js`):

```javascript
const API_BASE_URL = 'http://localhost:3001/api/v1';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Task operations
  async getTasks() {
    const response = await this.request('/tasks');
    return response.data || [];
  }

  async getTask(id) {
    const response = await this.request(`/tasks/${id}`);
    return response.data;
  }

  async createTask(taskData) {
    const response = await this.request('/tasks', {
      method: 'POST',
      body: taskData,
    });
    return response.data;
  }

  async updateTask(id, taskData) {
    const response = await this.request(`/tasks/${id}`, {
      method: 'PATCH',
      body: taskData,
    });
    return response.data;
  }

  async deleteTask(id) {
    await this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTask(id) {
    const response = await this.request(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
    return response.data;
  }
}

export default new ApiService();
```

2. **Update App.js to use API**:

Replace localStorage operations with API calls:

```javascript
import ApiService from './services/api';

// Replace useEffect for loading tasks
useEffect(() => {
  const loadTasks = async () => {
    try {
      const tasks = await ApiService.getTasks();
      setTasks(tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      // Optionally show error message to user
    }
  };
  loadTasks();
}, []);

// Update addTask function
const addTask = async (taskData) => {
  try {
    const newTask = await ApiService.createTask(taskData);
    setTasks([...tasks, newTask]);
  } catch (error) {
    console.error('Failed to create task:', error);
  }
};

// Similar updates for updateTask, deleteTask, toggleComplete
```

### Step 2: Backend Implementation Checklist

- [ ] Set up Express/Nest.js/Spring Boot server
- [ ] Configure MySQL database connection
- [ ] Create tasks table with migration script
- [ ] Implement GET /api/v1/tasks endpoint
- [ ] Implement GET /api/v1/tasks/:id endpoint
- [ ] Implement POST /api/v1/tasks endpoint with validation
- [ ] Implement PATCH /api/v1/tasks/:id endpoint
- [ ] Implement DELETE /api/v1/tasks/:id endpoint
- [ ] Implement PATCH /api/v1/tasks/:id/toggle endpoint
- [ ] Add error handling middleware
- [ ] Add CORS configuration for frontend
- [ ] Add request validation
- [ ] Test all endpoints with Postman/curl

### Step 3: CORS Configuration

The backend must allow requests from the frontend:

**Express.js example:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));
```

**Nest.js example:**
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(3001);
}
```

---

## Authentication (Optional)

If you plan to add user authentication later, consider these endpoints:

### POST /api/v1/auth/register
### POST /api/v1/auth/login
### POST /api/v1/auth/logout
### GET /api/v1/auth/me

**JWT Token Format:**
```
Authorization: Bearer <jwt_token>
```

**Protected Routes:**
Add middleware to verify JWT tokens for task endpoints if authentication is required.

---

## Testing Examples

### Using cURL

```bash
# Get all tasks
curl http://localhost:3001/api/v1/tasks

# Create a task
curl -X POST http://localhost:3001/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","description":"Test description"}'

# Update a task
curl -X PATCH http://localhost:3001/api/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title"}'

# Toggle task completion
curl -X PATCH http://localhost:3001/api/v1/tasks/1/toggle

# Delete a task
curl -X DELETE http://localhost:3001/api/v1/tasks/1
```

### Using Postman

1. Create a new collection "Task Management API"
2. Add requests for each endpoint
3. Set base URL: `http://localhost:3001/api/v1`
4. Set headers: `Content-Type: application/json`
5. Test all CRUD operations

---

## Additional Notes

1. **ID Format**: The frontend currently uses string IDs (Date.now().toString()). The backend can use integer IDs, but ensure they're converted to strings in API responses for consistency.

2. **Timestamps**: Always return timestamps in ISO 8601 format (e.g., "2025-11-13T10:30:00.000Z").

3. **Validation**: 
   - Title is required and should be non-empty after trimming
   - Title max length: 255 characters
   - Description is optional

4. **Performance**: Consider adding pagination for GET /tasks if the number of tasks grows large:
   ```
   GET /api/v1/tasks?page=1&limit=20
   ```

5. **Soft Delete**: Consider implementing soft deletes (mark as deleted instead of actually deleting) for audit purposes.

---

## Support

If you have questions about the frontend implementation or need clarification on any API specification, please refer to:
- Frontend code in `/src/App.js` and `/src/components/`
- This documentation

Good luck with the backend implementation! 🚀

