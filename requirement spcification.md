# Requirement Specification
## version 1.1
## Document Overview
### Purpose
This document defines the requirements for "Sprintfy" to provide a unified  reference for product, development, and testing teams. The document specifies the system’s functional requirements (FR), non-functional requirements (NFR), business  boundaries, key scenarios, and quality standards to ensure alignment between implementation and documentation.  
### Scope
#### System Boundaries
The system provides browser-based project and kanban management, to-do-list, license authentication.  
#### Core Value
Centered on a concise kanban interface, the system helps teams visualize work, limit work in progress, and then improve  delivery flow.  
### Role  
Leanna:Frontend, test document,implementation document.
Yanice:Frontend, implementation document.
Yiming:Backend,database,requirment spcification.
### Reference Materials  
GPT-5 (For document frame and translation from Chinese)  
---
## Background and Objectives  
### Problem Statement and Motivation
Teams face challenges such as unclear task assignment, we build a to-do list for teams or people to help them plan and finish their tasks.
### Success Metrics
1.**Onboarding**: New users take ≤10 minutes from registration to successfully creating their first kanban board and adding a task.  
2.**Usability**: Success rate of critical path tasks ≥ 98%.  
3.**Stability**: Error rate < 0.5%; end-to-end pass rate for key use cases ≥ 95%.  
---
## Stakeholders and User Personas  
### Stakeholder List
System Administrators: Maintain the system, manage licenses, view audit logs, and export data.
Project Members: Create/update tasks, collaborate via comments.
Guests : Need a license key to enter the website.
### User Personas
User A is a development member. He checks personal tasks daily, updates task status via drag-and-drop,.
### Scenarios
Login → View personal kanban boards → Handle upcoming tasks → Update task status via drag-and-drop  → View reports  → Logout
## Constraints and Assumptions  
### Technical Constraints
- Browsers: Supports Chrome/Firefox versions from the past 5 years; mobile devices use responsive design.
- Database: Uses a mysql database ; migration scripts are provided.
- Frameworks: Frontend React, Backend Python, REST API v1.  
### Operating Environment and Hardware
- Deployment: Supports Linux/Windows.
- Minimum Hardware: 4-core x86_64 2GHz CPU, 8GB RAM; no dedicated GPU required.
- Installation: Docker Compose or one-click scripts are provided for installation and startup.  
---
## System Scope and Context  
### System Context Description  
#### Human Actors
System Administrators, Members, Guests  
#### External Systems and Services
- Object Storage/File System: Stores attachments and exported files.
- This System:Frontend Web UI, Backend API Service, Database, License Authentication, Audit Logs
#### Boundary Description
- stored and send password in hashing way, ensuring the safety of users' information.
#### Context Diagram (Text Description)
Users access the Web UI via browsers over HTTP; the Web UI calls the backend REST API.
The backend accesses the database to store user, project, task, license,; it uses object storage to save attachments and exported files.
Administrators export audit logs and data backups via the admin interface.
---
## Functional Requirement  
### Category 1: Login and Security
1. Registration/Login/Logout
2. License Management
3. Database Storage of User Information
### Category 2: Progress Visualization
1. To-do-list
2. system Admin can generate license.
### Category 3: Features
1. dark-mode
---
## Non-Functional Requirement  
### Category 1: Consistency
1. Clear Division of Architectural Responsibilities
2. Scalability
3. Consistency in Design and Implementation
### Category 2: Database
1. Use of MySQL Database
2. Database Performance
3. Database Table Consistency
### Category 3: Human-Computer Interaction
1. Intuitive UI
2. Availability of Corresponding User Documentation
3. Accessibility
### Category 4: Account Security
1. Reliable License Verification Mechanism
2. Least Privilege Principle
3. Security Auditing
### Category 5: Performance Requirements
1. Short Response Time
2. Frontend Performance
### Category 6: Reliability & Maintainability
1. Operation Logs
2. Database Backup and Recovery Functions
3. Code Maintainability
###  Development Process
1. Traceability of Code Changes
2. Review of Submitted Modifications
---
## Use case diagram
```plantuml
@startuml
left to right direction
skinparam actorStyle awesome

actor "System Administrator" as Admin
actor "Project Manager" as PM
actor "Project Member" as Member
actor "Guest" as Guest

rectangle "Kanban Project Management System" as System {
  usecase "Register Account" as UC_Register
  usecase "Login/Logout" as UC_Login
  usecase "Enter/Verify License" as UC_License
  usecase "Create/Edit/Archive Project" as UC_CreateProject
  usecase "Configure Kanban Board/Columns/WIP" as UC_ManageBoard
  usecase "Create/Edit/Delete Tasks" as UC_TaskCRUD
  usecase "Drag-and-Drop Tasks" as UC_DragMove
  usecase "Set Dependencies/Blockages" as UC_Relations
  usecase "Filter & Search/Batch Operations" as UC_Filter
  usecase "View Burndown/Burnup/Cumulative Flow Charts" as UC_Charts
  usecase "Comment & Notifications" as UC_Comment
  usecase "Invite Members & Assign Roles" as UC_Invite
  usecase "View/Export Audit Logs" as UC_Audit
  usecase "Import/Export CSV/JSON" as UC_ImportExport
  usecase "SMTP Email Notifications" as UC_SMTP 
}

Admin --> UC_Audit
Admin --> UC_License
Admin --> UC_ImportExport

PM --> UC_CreateProject
PM --> UC_ManageBoard
PM --> UC_Invite
PM --> UC_Audit

Member --> UC_TaskCRUD
Member --> UC_DragMove
Member --> UC_Relations
Member --> UC_Filter
Member --> UC_Comment
Member --> UC_Charts
Member --> UC_ImportExport

Guest --> UC_Filter
Guest --> UC_Charts

Admin --> UC_Register
PM --> UC_Register
Member --> UC_Register
Guest --> UC_Register

Admin --> UC_Login
PM --> UC_Login
Member --> UC_Login
Guest --> UC_Login

UC_License ..> UC_Charts : License Required
UC_License ..> UC_SMTP : License Required
UC_License ..> UC_ImportExport : License Required
@enduml
```
## Sequence Diagram 1: Login and License Verification
```plantuml
@startuml
actor User as U
participant Browser as FE
participant "Auth API" as AuthAPI
participant "License API" as LicAPI
database Database as DB

U -> FE: Open login page and submit email/password
FE -> AuthAPI: POST /api/v1/auth/login {email, password}
AuthAPI -> DB: Query user/verify password hash
DB --> AuthAPI: User record
AuthAPI -> AuthAPI: Generate session/issue JWT
AuthAPI --> FE: 200 {accessToken, refreshToken, profile}

FE -> LicAPI: GET /api/v1/license/status (with Token)
LicAPI -> DB: Query license/features/validity period
DB --> LicAPI: License status
LicAPI --> FE: 200 {status: Valid|Expired, features: [...]}

FE -> U: Redirect to project list or reject access
@enduml
```
## Sequence Diagram 2: Drag Task to New Column
```plantuml
@startuml
actor Member as M
participant Browser as FE
participant "Task API" as TaskAPI
participant "WIP/Rules Service" as RuleSvc
participant "Audit Service" as AuditSvc
participant "Notification Service" as NotifySvc
participant "Simple Mail Transfer Protocol" as SMTP
database Database as DB

M -> FE: Drag card Task#123 to "Doing" column on Kanban board
FE -> TaskAPI: PATCH /api/v1/tasks/123/move {toColumnId}
TaskAPI -> RuleSvc: Validate column WIP limit and status transition validity
RuleSvc -> DB: Count current WIP in target column / Retrieve process configuration
DB --> RuleSvc: WIP count / process configuration
RuleSvc --> TaskAPI: Validation result (Pass/Fail, Reason)

alt Validation Failed
  TaskAPI --> FE: 409 {error: "WIP Exceeded" or "Unfinished Dependencies Exist"}
  FE -> M: Roll back card position and display reason
else Validation Passed
  TaskAPI -> DB: Start transaction
  TaskAPI -> DB: Update Task.columnId, status, position, updatedAt
  TaskAPI -> AuditSvc: Record audit log {actor, action:Move, from->to, taskId}
  AuditSvc -> DB: Insert audit log
  TaskAPI -> NotifySvc: Trigger event task.moved {taskId, from, to, mentions}
  NotifySvc -> SMTP
  TaskAPI -> DB: Commit transaction
  TaskAPI --> FE: 200 {task: ...}
  FE -> M: Confirm new position and show subtle notification "Moved"
end
@enduml
```
## Components diagram
```plantuml
@startuml
title Kanban-Based Web System - Component Diagram

actor "System Administrator" as Admin
actor "Project Administrator" as PAdmin
actor "Project Member" as Member
actor "Guest (Read-Only)" as Guest

rectangle "Client" as Client {
  [Web Frontend] <<component>>
}

package "Backend Services" as Backend {

  [Auth Service] <<component>>
  [License Service] <<component>>
  [User Management Service] <<component>>

  [Project Service] <<component>>
  [Board Service] <<component>>
  [Task Service] <<component>>

  [Reporting Service] <<component>>

  [Audit Service] <<component>>
  [Notification Service] <<component>>
  [File / Export Service] <<component>>
}

database "MySQL Database" as DB
cloud "Object Storage\n(Attachments / Exports)" as FS

' Actors to client
Admin --> Client
PAdmin --> Client
Member --> Client
Guest --> Client

' Client to frontend
Client --> [Web Frontend]

' Frontend to core services
[Web Frontend] --> [Auth Service] : Login / Logout / Register
[Web Frontend] --> [License Service] : License validation / status
[Web Frontend] --> [User Management Service] : Profiles / roles

[Web Frontend] --> [Project Service] : Manage projects
[Web Frontend] --> [Board Service] : Configure boards / columns
[Web Frontend] --> [Task Service] : CRUD tasks / drag-and-drop

[Web Frontend] --> [Reporting Service] : Charts / metrics
[Web Frontend] --> [File / Export Service] : Export data / download
[Web Frontend] --> [Audit Service] : View logs (admin only)

' Service collaborations (logical dependencies)
[Project Service] --> [User Management Service]
[Board Service] --> [Project Service]
[Task Service] --> [Board Service]
[Task Service] --> [User Management Service]

[Task Service] --> [Audit Service]
[Project Service] --> [Audit Service]
[License Service] --> [Audit Service]

[Task Service] --> [Notification Service]
[Project Service] --> [Notification Service]

[Reporting Service] --> [Task Service]
[Reporting Service] --> [Board Service]

[License Service] --> [User Management Service]

' Persistence and external systems
[Auth Service] --> DB
[License Service] --> DB
[User Management Service] --> DB
[Project Service] --> DB
[Board Service] --> DB
[Task Service] --> DB
[Reporting Service] --> DB
[Audit Service] --> DB
[Notification Service] --> DB
[File / Export Service] --> DB

[File / Export Service] --> FS

@enduml
```