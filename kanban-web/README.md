# Task Management Web Application

A modern, responsive web application for managing tasks with full CRUD (Create, Read, Update, Delete) operations. Built with React.

## Features

- ✅ **Create Tasks**: Add new tasks with title and optional description
- ✅ **Read Tasks**: View all tasks organized by active and completed
- ✅ **Update Tasks**: Edit existing tasks
- ✅ **Delete Tasks**: Remove tasks you no longer need
- ✅ **Mark Complete**: Toggle task completion status
- ✅ **Persistent Storage**: Tasks are saved to browser localStorage
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile devices
- ✅ **Modern UI**: Clean, intuitive interface with smooth animations

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

## Installation

1. Clone or navigate to the project directory:
```bash
cd CSCI3100Project2
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Building for Production

To create a production build:
```bash
npm run build
```

The optimized build will be in the `build` folder.

## Project Structure

```
├── csci3100_group22
│   ├── kanban-web
│   │   ├── public
│   │   │   └── index.html
│   │   ├── documents
│   │   │   ├── BACKEND_API_DOCUMENTATION.md
│   │   │   ├── BACKEND_QUICK_REFERENCE.md
│   │   │   ├── requirement spcification.md
│   │   │   └── Design And Implementation Docume....md
│   │   ├── src
│   │   │   ├── api
│   │   │   │   ├── api.js.example
│   │   │   │   └── authClient.js
│   │   │   ├── components
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── TaskForm.css
│   │   │   │   ├── TaskForm.js
│   │   │   │   ├── TaskItem.css
│   │   │   │   ├── TaskItem.js
│   │   │   │   ├── TaskList.css
│   │   │   │   └── TaskList.js
│   │   │   ├── context
│   │   │   │   └── AuthContext.jsx
│   │   │   ├── pages
│   │   │   │   ├── BoardsPage.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── App.css
│   │   │   ├── App.js
│   │   │   ├── App.jsx
│   │   │   ├── index.css
│   │   │   ├── index.js
│   │   │   └── main.jsx
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   └── README.md
│   └── PlantUML Diagrams
│       ├── Components diagram.png
│       ├── Sequence Diagram 1- Login and License Verification.png
│       ├── Sequence Diagram 2- Drag Task to New Column.png
│       └── Use case diagram.png
└── project.pdf
```

## Usage

1. **Adding a Task**: 
   - Enter a task title (required) and optional description
   - Click "Add Task" button

2. **Completing a Task**:
   - Click the checkbox next to a task to mark it as complete

3. **Editing a Task**:
   - Click the edit button (✏️) on any task
   - Modify the title or description
   - Click "Update Task" to save changes or "Cancel" to discard

4. **Deleting a Task**:
   - Click the delete button (🗑️) on any task
   - The task will be permanently removed

## Technical Details

- **Framework**: React 18.2.0
- **State Management**: React Hooks (useState, useEffect)
- **Storage**: Browser localStorage for persistence
- **Styling**: CSS with modern design patterns
- **Responsive**: Mobile-first approach with media queries

## Browser Support

- Chrome (last 5 years)
- Firefox (last 5 years)
- Safari (last 5 years)
- Edge (last 5 years)

## License

This project is created for educational purposes as part of CSCI3100 Project 2.
