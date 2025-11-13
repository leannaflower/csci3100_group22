import React, { useState, useEffect } from 'react';
import './App.css';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskId, taskData) => {
    // taskId is ignored when adding (will be undefined)
    // taskData is the second parameter
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description || '',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (taskId, taskData) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: taskData.title,
              description: taskData.description || '',
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
    setEditingTask(null);
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    if (editingTask?.id === taskId) {
      setEditingTask(null);
    }
  };

  const toggleComplete = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
  };

  const startEdit = (task) => {
    setEditingTask(task);
  };

  const cancelEdit = () => {
    setEditingTask(null);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="app-header">
          <h1>Task Management</h1>
          <p className="subtitle">Organize your work and stay productive</p>
        </header>

        <TaskForm
          onSubmit={editingTask ? updateTask : addTask}
          editingTask={editingTask}
          onCancel={cancelEdit}
        />

        <TaskList
          tasks={tasks}
          onDelete={deleteTask}
          onToggleComplete={toggleComplete}
          onEdit={startEdit}
        />
      </div>
    </div>
  );
}

export default App;

