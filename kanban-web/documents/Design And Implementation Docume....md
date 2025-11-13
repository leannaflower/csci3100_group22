# **Software Design and Implementation Documentation**

Project Name: Kanban-Based Web Application  
Version: 1.0  
Date: \[YYYY-MM-DD\]    
Authors: Leanna Fowler, Yanice Kwon, Yiming Zhao  
Status: Draft 2.0

\---

# **1\. Introduction**


## **1.1 Purpose**  

This document provides the technical design and implementation details of Group 22 Kanban-Based Project Management System. It describes the architecture, components, database schema, REST API, and development environment.

This serves as a developer-oriented reference for:

* maintaining code consistency  
* onboarding new contributors  
* supporting future extension (e.g., analytics, reporting, license enforcement)

## **1.2 Scope**  

In Scope (implemented or in-progress)

* React-based frontend (Login, Register, Boards, Tasks)  
* Complete task CRUD operations  
* Drag-and-drop task movement UI (frontend)  
* License screen (UI implemented, backend TBD)  
* User authentication (frontend \+ backend endpoints stubbed)  
* Node.js \+ Express.js  backend with RESTful API  
* MySQL database for tasks and users  
* Dedicated API documentation and quick references  
* Context-based frontend state management (AuthContext, etc.)

Out of Scope (not implemented yet, future enhancement)

* Admin dashboard  
* Full reporting features (burnup, CFD, throughput)  
* Webhooks  
* Email notifications (SMTP)  
* Attachments/exports  
* Full WIP rule engine

## **1.3 Definitions, Acronyms, and Abbreviations**  

### **1.3 Definitions, Acronyms, and Abbreviations**

| Term | Definition |
| ----- | ----- |
| **API** | Application Programming Interface – a set of endpoints that allow the frontend to communicate with the backend |
| **CRUD** | Create, Read, Update, Delete – the four basic operations of persistent storage |
| **MVC** | Model-View-Controller – an architectural pattern that separates data (Model), user interface (View), and business logic (Controller) |
| **ORM** | Object-Relational Mapping – a programming technique that converts data between incompatible type systems (e.g., Sequelize, Prisma) |
| **JWT** | JSON Web Token – a compact, URL-safe means of representing claims to be transferred between two parties (alternative to session-based auth) |
| **REST** | Representational State Transfer – an architectural style for designing networked applications using HTTP methods |
| **Session** | Server-side storage of user authentication state, typically referenced by a cookie sent to the client |
| **bcrypt** | A password-hashing function designed to be computationally expensive to resist brute-force attacks |
| **Middleware** | Software layer that sits between the request and response cycle, used for authentication, logging, etc. |
| **CORS** | Cross-Origin Resource Sharing – a security feature that controls which domains can access backend resources |
| **CSRF** | Cross-Site Request Forgery – an attack that tricks authenticated users into executing unwanted actions |
| **Foreign Key (FK)** | A database field that links one table to another, establishing relationships between entities |
| **Primary Key (PK)** | A unique identifier for a database record |
| **HTTP Methods** | GET (retrieve), POST (create), PUT (update), DELETE (remove), PATCH (partial update) |

# **2\. Overall System Architecture**


## **2.1 Architecture Summary**

\[ React Frontend \] \<–––HTTP/JSON–––\> \[ Express Backend \] \<––SQL––\> \[ MySQL DB \]

**Frontend**

* React 18  
* React Router  
* AuthContext for global login state  
* Custom UI components: Navbar, TaskList, TaskItem, TaskForm, BoardsPage

**Backend**

* Express.js  
* Modular route handlers under /api/v1  
* MySQL using mysql2/promise  
* MVC-inspired structure (controllers, services, routes)

**Database**

* MySQL  
* Tables: tasks, users (in progress), sessions/auth (TBD), future boards and projects

## 

## **2.2 Technology Stack Table**

| Layer | Technology | Description |
| ----- | ----- | ----- |
| Frontend | React 18 \+ JSX | Component-based UI |
| Frontend Styling | Plain CSS | TaskForm.css, TaskItem.css, TaskList.css |
| Backend | Node.js \+ Express.js | REST API server |
| Database | MySQL 8 | Persistent storage |
| API Docs | Markdown | `BACKEND_API_DOCUMENTATION.md`, `BACKEND_QUICK_REFERENCE.md` |
| Auth | JWT (planned) | Login/logout flow |
| Hosting | TBD | (Railway, Vercel, Render optional) |

### **2.3 Key Design Principles**

| Principle | How It Is Applied |
| ----- | ----- |
| **Separation of Concerns** | Routes → Controllers → Services → DB Layer |
| **API-first development** | Backend API doc written before integration |
| **Stateless backend** | Requests contain all required auth data (JWT planned) |
| **Error standardization** | All responses follow `{success, data, message/error}` |
| **Open-ended extensibility** | Boards, Projects, WIP logic can be added without breaking tasks |

# **3\. Detailed Component Design**


## **3.1 Module/Component Overview**  

This system follows a layered architecture with clear separation between frontend, backend services, and infrastructure. Each module below is defined by responsibility, public interface, and dependencies.

### **3.1.1 Frontend**

Navbar

* Responsibility: Navigation \+ login/logout visibility  
* Inputs: AuthContext  
* Outputs: Route changes

LoginPage / RegisterPage

* Handles user authentication  
* Sends POST requests to /auth/login and /auth/register

BoardsPage

* Displays user’s boards (currently static / in-progress)

TaskList

* Fetches tasks from backend via apiClient.js  
* Renders list of TaskItem components


TaskItem

* Displays individual task  
* Supports: toggle completion, delete, edit

TaskForm

* Creates new tasks via POST /api/v1/tasks

### **3.1.2 Backend**

Auth Service

* Responsibility: login, register, validate password  
* Endpoints: /auth/register, /auth/login  
* Dependencies: MySQL users table

Task Service

* Responsibility: CRUD operations for tasks  
* Endpoints:  
  `GET /tasks`    
  `POST /tasks`    
  `GET /tasks/:id`    
  `PATCH /tasks/:id`    
  `PATCH /tasks/:id/toggle`    
  `DELETE /tasks/:id`    
  * Dependencies: MySQL tasks table

### **3.1.3 Infrastructure components**

| Component | Purpose |
| ----- | ----- |
| MySQL DB | Persists users and tasks |
| Express Server | Core backend |
| CORS Middleware | Allows frontend to call backend |
| dotenv | Secure environment variables |
| ESLint | Linting |

## **3.2 Data Design**  

#### **3.2.1 Tables**

**user**

| Field | Type | Notes |
| ----- | ----- | ----- |
| id | INT PK | Auto-increment |
| email | VARCHAR(255) | Unique |
| password\_hash | VARCHAR(255) | Bcrypt |
| display\_name | VARCHAR(255) | Optional |
| created\_at | TIMESTAMP | default |

**tasks**

| Field | Type | Notes |
| ----- | ----- | ----- |
| id | INT PK | Auto-increment |
| title | VARCHAR(255) | Required |
| description | TEXT | Optional |
| completed | BOOLEAN | Default false |
| created\_at | TIMESTAMP |  |
| updated\_at | TIMESTAMP |  |

## **3.3 API Design**  

All APIs are exposed under a versioned prefix, for example /api/v1. JSON is used for requests and responses. Authentication is required for all non public endpoints via token or secure session cookie.

3.3.1 Authentication endpoints

**POST `/api/v1/auth/register`**

* Request

`{`  
  `"title": "New task",`  
  `"description": "Optional"`  
`}`

* Response

`{`  
  `"success": true,`  
  `"message": "Task created successfully",`  
  `"data": {`  
    `"id": 1,`  
    `"title": "New task",`  
    `"description": "Optional",`  
    `"completed": false`  
  `}`  
`}`

**POST `/api/v1/auth/login`**

* Request: email and password  
* Response: tokens and profile

**POST `/api/v1/auth/logout`**

* Invalidates current session or token.

### **3.3.2 License endpoints**

**POST `/api/v1/licenses/validate`**

* Request

`{`  
  `"licenseKey": "AAAA-BBBB-CCCC-DDDD"`  
`}`

* Response

`{`  
  `"status": "valid",`  
  `"validUntil": "2026-01-01",`  
  `"features": ["REPORTING", "EXPORT"]`  
`}`

**GET `/api/v1/licenses/status`**

* Returns license status for current user or project.

### **3.3.3 Project, board, and member endpoints**

**GET `/api/v1/projects`**

* Returns projects visible to current user.

**POST `/api/v1/projects`**

* Create project with name and optional description.

**GET `/api/v1/projects/{projectId}`**

* Returns project details, members, boards.

**POST `/api/v1/projects/{projectId}/members`**

* Invite or update member with a role.

**GET `/api/v1/projects/{projectId}/boards`**

* List boards for a project.

**POST `/api/v1/projects/{projectId}/boards`**

* Create a kanban board.

**POST `/api/v1/boards/{boardId}/columns`**

* Create column with name, position, and WIP limit.

**PATCH `/api/v1/columns/{columnId}`**

* Update column name, position, or WIP limit.

### **3.3.4 Task and comment endpoints**

**GET `/api/v1/boards/{boardId}/tasks`**

* List tasks by column for board display.

**POST `/api/v1/boards/{boardId}/tasks`**

* Create new task.

**PATCH `/api/v1/tasks/{taskId}`**

* Update task fields such as title, description, assignee, due date.

**PATCH `/api/v1/tasks/{taskId}/move`**

* Request

`{`  
  `"toColumnId": 5`  
`}`

* Response on success

`{`  
  `"task": {`  
    `"id": 123,`  
    `"columnId": 5,`  
    `"status": "Doing"`  
  `}`  
`}`

* Response on WIP violation

`{`  
  `"error": "WIP_LIMIT_EXCEEDED",`  
  `"message": "Target column limit is 5, current is 5"`  
`}`

**POST `/api/v1/tasks/{taskId}/comments`**

* Add a comment to a task.

### **3.3.5 Reporting endpoints**

**GET `/api/v1/projects/{projectId}/reports/burndown`**

* Query parameters: from, to.  
* Response: array of date and remaining work points.

**GET `/api/v1/projects/{projectId}/reports/cfd`**

* Response: cumulative flow data by column and date.

**GET `/api/v1/projects/{projectId}/reports/throughput`**

* Response: completed tasks per interval.

### **3.3.6 Audit, export, and admin endpoints**

**GET `/api/v1/audit`**

* Admin only. Supports filters by actor, project, action, date.

**GET `/api/v1/export/tasks?projectId={projectId}`**

* Returns CSV or JSON snapshot of tasks.

### **3.3.7 Error handling and conventions**

* Status 200 or 201 for success.  
* Status 400 for invalid input.  
* Status 401 for missing or invalid authentication.  
* Status 403 for insufficient role or missing license entitlement.  
* Status 404 for non existing resource.  
* Status 409 for WIP or business rule conflicts.  
* Status 500 for unexpected server errors.

Standard error body  
`{`  
  `"error": "CONFLICT",`  
  `"message": "WIP limit exceeded for column Doing",`  
  `"details": {`  
    `"limit": 5,`  
    `"current": 5`  
  `}`  
`}`

# **4\. Implementation Plan**


## **4.1 Development Environment Setup**  

**Prerequisites**

* Node.js 18+  
* MySQL 8  
* npm 9+

**Steps**  
`git clone https://github.com/group22/kanban-web`  
`cd kanban-web/backend`  
`npm install`  
`cp .env.example .env`  
`npm run dev`

**Frontend**:  
`cd ../kanban-web`  
`npm install`  
`npm start`

## **4.2 Coding Standards**  

* `Prettier` formatting  
* Naming conventions:  
  * Components start with capital letter  
  * API files: apiClient.js, authClient.js

## **4.3 Testing Strategy**  

**Planned Tests**

| Type | Tool | Examples |
| ----- | ----- | ----- |
| Unit | Jest | Test task service functions |
| Integration | Postman / Supertest | API endpoints |
| Frontend tests | React Testing Library | Task rendering |
| Manual | Browser testing | Login → Boards → Create task |

* Tests run automatically on PR via GitHub Actions.  
* All tests must pass before merging to `main`.

## **4.4 Build & Deployment**  

1. On Push to `feature/*`:  
   * Install deps → lint → run unit tests  
2. On PR to `main`:  
   * Run integration \+ E2E tests against emulators  
   * Generate preview URL (via Vercel or Firebase Hosting preview channels)  
3. On Merge to `main`:  
   * Build optimized production bundle  
   * Deploy to Staging Firebase project  
   * Manual QA sign-off required  
4. Production Release:  
   * Tagged release triggers deployment to Production Firebase project  
   * Rollback: Revert tag \+ redeploy previous version

Environments:

* Dev: Local \+ emulator (developer machines)  
* Staging: `https://kanban-app-staging.web.app`  
* Production: `https://kanban-app-prod.web.app`

\---

# **5\. Risks and Mitigations**


| Risk | Likelihood | Mitigation |
| ----- | ----- | ----- |
| Backend not finished on time | Medium | Prioritize essential endpoints only |
| Drag and drop breaks with backend sync | Medium | Add fallback buttons for moving tasks |
| License system incomplete | High | Deliver placeholder \+ clear documentation |
| Database corruption | Low | Nightly SQL dumps |

# **6\. Appendix**  

**COME BACK TO THIS**

* API documentation (included in files)  
* Database schema SQL  
* Component Diagram (from requirements doc)  
* Sequence Diagrams

