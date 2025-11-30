# Backend API Documentation for Task Management System

## Overview

This document provides specifications for the backend API supporting the Task Management web frontend. The frontend is built with React and uses a Kanban board interface with three columns: "To Do", "Doing", and "Done". The system includes user authentication and task management functionality.

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Task Management Endpoints](#task-management-endpoints)
4. [Data Models](#data-models)
5. [Request/Response Formats](#requestresponse-formats)
6. [Error Handling](#error-handling)
7. [Database Schema](#database-schema)
8. [Integration Guide](#integration-guide)

---

## API Endpoints

### Base URL
```
http://8.217.112.161:8000
```

### Authentication Base Path
```
/auth
```

### Task Management Base Path
```
/api/v1/tasks
```

### Endpoints Summary

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No |
| GET | `/users/me` | Get current user info | Yes |

#### Task Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/tasks` | Get all tasks for user | Yes |
| GET | `/api/v1/tasks/:id` | Get a single task | Yes |
| POST | `/api/v1/tasks` | Create a new task | Yes |
| PATCH | `/api/v1/tasks/:id` | Update a task | Yes |
| DELETE | `/api/v1/tasks/:id` | Delete a task | Yes |
| PATCH | `/api/v1/tasks/:id/toggle` | Toggle task completion | Yes |
| PATCH | `/api/v1/tasks/:id/move` | Move task to different column | Yes |

---

## Authentication Endpoints

### 1. POST /auth/register

**Description:** Register a new user account

**Request:**
```
POST /auth/register
Headers:
  Content-Type: application/json
Body:
{
  "username": "user@example.com",
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Request Body Schema:**
- `username` (string, required): Username (can be email)
- `email` (string, required): User email address
- `password` (string, required): User password

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Username already exists"
}
```

---

### 2. POST /auth/login

**Description:** Authenticate user and receive access tokens

**Request:**
```
POST /auth/login
Headers:
  Content-Type: application/json
Body:
{
  "username": "user@example.com",
  "password": "securepassword"
}
```

**Request Body Schema:**
- `username` (string, required): Username or email
- `password` (string, required): User password

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Incorrect username or password"
}
```

---

### 3. POST /auth/refresh

**Description:** Refresh access token using refresh token

**Request:**
```
POST /auth/refresh
Headers:
  Content-Type: application/json
Body:
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body Schema:**
- `refresh_token` (string, required): Valid refresh token

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### 4. GET /users/me

**Description:** Get current authenticated user information

**Request:**
```
GET /users/me
Headers:
  Authorization: Bearer <access_token>
  Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "user@example.com",
  "email": "user@example.com",
  "status": "active"
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Could not validate credentials"
}
```

---

## Task Management Endpoints

### 1. GET /api/v1/tasks

**Description:** Retrieve all tasks for the authenticated user

**Request:**
```
GET /api/v1/tasks
Headers:
  Content-Type: application/json
  Authorization: Bearer <access_token>
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
      "column": "To Do",
      "completed": false,
      "createdAt": "2025-11-13T10:30:00.000Z",
      "updatedAt": "2025-11-13T10:30:00.000Z"
    },
    {
      "id": "2",
      "title": "Review code",
      "description": "",
      "column": "Done",
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
- `column` (string): Filter by column name ("To Do", "Doing", "Done")
  - Example: `/api/v1/tasks?column=Doing`

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHORIZED"
  }
}
```

---

### 2. GET /api/v1/tasks/:id

**Description:** Retrieve a single task by ID

**Request:**
```
GET /api/v1/tasks/1
Headers:
  Content-Type: application/json
  Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Complete project documentation",
    "description": "Write API documentation for backend",
    "column": "To Do",
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
  Authorization: Bearer <access_token>
Body:
{
  "title": "New task title",
  "description": "Optional task description",
  "column": "To Do"
}
```

**Request Body Schema:**
- `title` (string, required): Task title (max 255 characters)
- `description` (string, optional): Task description (text)
- `column` (string, optional): Column name - "To Do", "Doing", or "Done" (default: "To Do")

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "3",
    "title": "New task title",
    "description": "Optional task description",
    "column": "To Do",
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
  Authorization: Bearer <access_token>
Body:
{
  "title": "Updated task title",
  "description": "Updated description",
  "column": "Doing"
}
```

**Request Body Schema:**
- `title` (string, optional): Updated task title
- `description` (string, optional): Updated task description
- `column` (string, optional): Column name - "To Do", "Doing", or "Done"
- `completed` (boolean, optional): Completion status
- Note: All fields are optional, but at least one should be provided

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "1",
    "title": "Updated task title",
    "description": "Updated description",
    "column": "Doing",
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
  Authorization: Bearer <access_token>
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

**Description:** Toggle task completion status (moves between "To Do" and "Done" columns)

**Request:**
```
PATCH /api/v1/tasks/1/toggle
Headers:
  Content-Type: application/json
  Authorization: Bearer <access_token>
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
    "column": "Done",
    "completed": true,
    "createdAt": "2025-11-13T10:30:00.000Z",
    "updatedAt": "2025-11-13T12:20:00.000Z"
  }
}
```

**Note:** Toggling a task in "Done" moves it to "To Do", and vice versa.

---

### 7. PATCH /api/v1/tasks/:id/move

**Description:** Move a task to a different column (drag and drop)

**Request:**
```
PATCH /api/v1/tasks/1/move
Headers:
  Content-Type: application/json
  Authorization: Bearer <access_token>
Body:
{
  "column": "Doing"
}
```

**Request Body Schema:**
- `column` (string, required): Target column name - "To Do", "Doing", or "Done"

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task moved successfully",
  "data": {
    "id": "1",
    "title": "Complete project documentation",
    "description": "Write API documentation for backend",
    "column": "Doing",
    "completed": false,
    "createdAt": "2025-11-13T10:30:00.000Z",
    "updatedAt": "2025-11-13T12:25:00.000Z"
  }
}
```

**Note:** When a task is moved to "Done", `completed` should be set to `true`. When moved to "To Do" or "Doing", `completed` should be `false`.

---

## Data Models

### Task Object

```typescript
interface Task {
  id: string | number;           // Unique identifier
  title: string;                  // Task title (required, max 255 chars)
  description: string;            // Task description (optional, text)
  column: string;                 // Column name: "To Do", "Doing", or "Done" (required)
  completed: boolean;             // Completion status (default: false, true when column is "Done")
  createdAt: string;              // ISO 8601 timestamp
  updatedAt: string;              // ISO 8601 timestamp
  userId?: number;                // User ID (for multi-user support)
}
```

### User Object

```typescript
interface User {
  id: number;                     // Unique identifier
  username: string;               // Username (can be email)
  email: string;                  // Email address
  status: string;                 // User status (e.g., "active")
}
```

### Authentication Token Response

```typescript
interface AuthResponse {
  access_token: string;            // JWT access token
  refresh_token: string;          // JWT refresh token
  token_type: string;             // Token type (usually "bearer")
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
- `UNAUTHORIZED` - Authentication required or invalid token
- `FORBIDDEN` - User doesn't have permission to access this resource
- `USER_NOT_FOUND` - User doesn't exist
- `INVALID_CREDENTIALS` - Invalid username or password
- `USER_ALREADY_EXISTS` - Username or email already registered
- `INTERNAL_ERROR` - Unexpected server error

---

## Database Schema

### MySQL Table: `users`

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### MySQL Table: `tasks`

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
  INDEX idx_user_id (user_id),
  INDEX idx_column (column_name),
  INDEX idx_completed (completed),
  INDEX idx_created_at (created_at),
  CHECK (column_name IN ('To Do', 'Doing', 'Done'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Note:** The `column_name` field stores the Kanban column name. The `completed` field should be automatically set to `true` when `column_name` is "Done", and `false` otherwise.

---

## Integration Guide

### Step 1: Authentication Setup

The frontend uses JWT tokens for authentication. Tokens are stored in localStorage:

- `accessToken`: Short-lived token for API requests
- `refreshToken`: Long-lived token for refreshing access tokens

**Token Usage:**
All task management endpoints require the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### Step 2: Update Frontend to Use API

The frontend currently uses localStorage for tasks. To connect to the backend, you'll need to:

1. **Create an API service file** (`src/api/taskClient.js`):

```javascript
const API_BASE_URL = 'http://8.217.112.161:8000/api/v1';

class TaskService {
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAccessToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
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
        throw new Error(data.error?.message || data.detail || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Task operations
  async getTasks(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.completed !== undefined) {
      queryParams.append('completed', filters.completed);
    }
    if (filters.column) {
      queryParams.append('column', filters.column);
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;
    const response = await this.request(endpoint);
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

  async moveTask(id, column) {
    const response = await this.request(`/tasks/${id}/move`, {
      method: 'PATCH',
      body: { column },
    });
    return response.data;
  }
}

export default new TaskService();
```

2. **Update BoardsPage.jsx to use API**:

Replace localStorage operations with API calls:

```javascript
import TaskService from '../api/taskClient';
import { useAuth } from '../context/AuthContext';

export default function BoardsPage() {
  const { accessToken } = useAuth();
  const [tasks, setTasks] = useState([]);

  // Load tasks from API
  useEffect(() => {
    if (!accessToken) return;
    
    const loadTasks = async () => {
      try {
        const tasks = await TaskService.getTasks();
        setTasks(tasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    };
    loadTasks();
  }, [accessToken]);

  // Add a new task
  async function addTask(columnName, title) {
    try {
      const newTask = await TaskService.createTask({
        title,
        column: columnName,
      });
      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  }

  // Move task to different column
  async function moveTask(taskId, newColumn) {
    try {
      const updatedTask = await TaskService.moveTask(taskId, newColumn);
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? updatedTask : t))
      );
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  }

  // Update task
  async function updateTask(taskId, updates) {
    try {
      const updatedTask = await TaskService.updateTask(taskId, updates);
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? updatedTask : t))
      );
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  // Toggle task completion
  async function toggleTaskComplete(taskId) {
    try {
      const updatedTask = await TaskService.toggleTask(taskId);
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? updatedTask : t))
      );
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  }

  // Delete task
  async function deleteTask(id) {
    try {
      await TaskService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }

  // ... rest of component
}
```

### Step 3: Backend Implementation Checklist

**Authentication:**
- [ ] Set up user registration endpoint (POST /auth/register)
- [ ] Set up user login endpoint (POST /auth/login)
- [ ] Set up token refresh endpoint (POST /auth/refresh)
- [ ] Set up current user endpoint (GET /users/me)
- [ ] Implement JWT token generation and validation
- [ ] Add password hashing (bcrypt/argon2)

**Task Management:**
- [ ] Set up Express/FastAPI/Spring Boot server
- [ ] Configure MySQL database connection
- [ ] Create users table with migration script
- [ ] Create tasks table with migration script (include column_name field)
- [ ] Implement authentication middleware
- [ ] Implement GET /api/v1/tasks endpoint (user-scoped)
- [ ] Implement GET /api/v1/tasks/:id endpoint (user-scoped)
- [ ] Implement POST /api/v1/tasks endpoint with validation
- [ ] Implement PATCH /api/v1/tasks/:id endpoint
- [ ] Implement DELETE /api/v1/tasks/:id endpoint
- [ ] Implement PATCH /api/v1/tasks/:id/toggle endpoint
- [ ] Implement PATCH /api/v1/tasks/:id/move endpoint
- [ ] Add error handling middleware
- [ ] Add CORS configuration for frontend
- [ ] Add request validation
- [ ] Test all endpoints with Postman/curl

### Step 4: CORS Configuration

The backend must allow requests from the frontend:

**Express.js example:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'http://8.217.112.161:3000'], // Frontend URLs
  credentials: true
}));
```

**FastAPI example:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://8.217.112.161:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Nest.js example:**
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'http://8.217.112.161:3000'],
    credentials: true,
  });
  await app.listen(8000);
}
```

### Step 5: Authentication Middleware

All task management endpoints should verify the JWT token:

**Express.js example:**
```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: { message: 'Authentication required', code: 'UNAUTHORIZED' } 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: { message: 'Invalid token', code: 'UNAUTHORIZED' } 
      });
    }
    req.user = user;
    next();
  });
}

// Apply to task routes
app.get('/api/v1/tasks', authenticateToken, getTasks);
```

---

## Testing Examples

### Using cURL

**Authentication:**
```bash
# Register a new user
curl -X POST http://8.217.112.161:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://8.217.112.161:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Get current user (replace TOKEN with actual token)
curl http://8.217.112.161:8000/users/me \
  -H "Authorization: Bearer TOKEN"
```

**Task Management:**
```bash
# Get all tasks (replace TOKEN with actual token)
curl http://8.217.112.161:8000/api/v1/tasks \
  -H "Authorization: Bearer TOKEN"

# Create a task
curl -X POST http://8.217.112.161:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Test task","description":"Test description","column":"To Do"}'

# Update a task
curl -X PATCH http://8.217.112.161:8000/api/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Updated title","column":"Doing"}'

# Move task to different column
curl -X PATCH http://8.217.112.161:8000/api/v1/tasks/1/move \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"column":"Done"}'

# Toggle task completion
curl -X PATCH http://8.217.112.161:8000/api/v1/tasks/1/toggle \
  -H "Authorization: Bearer TOKEN"

# Delete a task
curl -X DELETE http://8.217.112.161:8000/api/v1/tasks/1 \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Create a new collection "Task Management API"
2. Add environment variables:
   - `base_url`: `http://8.217.112.161:8000`
   - `access_token`: (set after login)
3. Add requests for each endpoint:
   - Authentication: Register, Login, Refresh Token, Get Current User
   - Tasks: Get All, Get One, Create, Update, Delete, Toggle, Move
4. Set base URL: `{{base_url}}`
5. Set headers: 
   - `Content-Type: application/json`
   - `Authorization: Bearer {{access_token}}` (for protected routes)
6. Test authentication flow first, then task operations

---

## Additional Notes

1. **ID Format**: The frontend currently uses string IDs (Date.now().toString()). The backend can use integer IDs, but ensure they're converted to strings in API responses for consistency.

2. **Timestamps**: Always return timestamps in ISO 8601 format (e.g., "2025-11-13T10:30:00.000Z").

3. **Validation**: 
   - Title is required and should be non-empty after trimming
   - Title max length: 255 characters
   - Description is optional
   - Column must be one of: "To Do", "Doing", "Done"
   - When column is "Done", completed should be true; otherwise false

4. **Kanban Board Structure**:
   - The system uses a three-column Kanban board: "To Do", "Doing", "Done"
   - Tasks can be moved between columns via drag-and-drop
   - Tasks in "Done" column are marked as completed
   - The `column` field is required for all tasks

5. **User Scoping**: All task operations should be scoped to the authenticated user. Users should only see and modify their own tasks.

6. **Performance**: Consider adding pagination for GET /tasks if the number of tasks grows large:
   ```
   GET /api/v1/tasks?page=1&limit=20
   ```

7. **Soft Delete**: Consider implementing soft deletes (mark as deleted instead of actually deleting) for audit purposes.

8. **Token Management**: 
   - Access tokens should have a short expiration time (e.g., 15 minutes)
   - Refresh tokens should have a longer expiration time (e.g., 7 days)
   - Implement automatic token refresh in the frontend before expiration

---

## Support

If you have questions about the frontend implementation or need clarification on any API specification, please refer to:
- Frontend code in `/src/App.js` and `/src/components/`
- This documentation

Good luck with the backend implementation! 🚀

