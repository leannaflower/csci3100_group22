// from Yanice's file App.js for the Form

import React, { useState, useEffect } from "react";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";

export default function BoardsPage() {
    const [tasks, setTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);

    // Load tasks from localStorage
    useEffect(() => {
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
            setTasks(JSON.parse(savedTasks));
        }
    }, []);

    // Save tasks to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    function addTask(_taskIdIgnored, taskData) {
        const newTask = {
            id: Date.now().toString(),
            title: taskData.title,
            description: taskData.description || "",
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setTasks((prev) => [...prev, newTask]);
    }

    function updateTask(taskId, taskData) {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        title: taskData.title,
                        description: taskData.description || "",
                        updatedAt: new Date().toISOString(),
                    }
                    : task
            )
        );
        setEditingTask(null);
    }

    function deleteTask(taskId) {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
        if (editingTask?.id === taskId) {
            setEditingTask(null);
        }
    }

    function toggleComplete(taskId) {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        completed: !task.completed,
                        updatedAt: new Date().toISOString(),
                    }
                    : task
            )
        );
    }

    function startEdit(task) {
        setEditingTask(task);
    }

    function cancelEdit() {
        setEditingTask(null);
    }

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
