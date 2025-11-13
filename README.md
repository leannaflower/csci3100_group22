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
CSCI3100Project2/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── TaskForm.js     # Form for creating/editing tasks
│   │   ├── TaskForm.css
│   │   ├── TaskList.js     # Container for displaying tasks
│   │   ├── TaskList.css
│   │   ├── TaskItem.js     # Individual task component
│   │   └── TaskItem.css
│   ├── App.js              # Main application component
│   ├── App.css
│   ├── index.js            # Application entry point
│   └── index.css           # Global styles
├── package.json
└── README.md
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
