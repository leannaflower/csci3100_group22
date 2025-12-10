// BoardsPage.jsx
import React, { useState, useEffect } from "react";
import KanbanColumn from "../components/KanbanColumn";
import "../components/Kanban.css";
import { useAuth } from "../context/AuthContext";

export default function BoardsPage() {
    const { user } = useAuth();

    const [tasks, setTasks] = useState([]); // "tasks" is the full list of all tasks on the board

    const columns = ["To Do", "Doing", "Done"]; // The three columns that will appear on the board

    const displayName = // For displaying username/username on top of the page
        user?.displayName ||
        user?.email ||
        "Guest";

    // On first load, try to read any saved tasks from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("kanbanTasks");
        if (saved) {
            setTasks(JSON.parse(saved));
        }
    }, []);

    // Whenever "tasks" changes, save the latest version to localStorage
    useEffect(() => {
        localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
    }, [tasks]);

    // Add a new task into a specific column
    function addTask(columnName, title) {
        const now = new Date().toISOString();
        const newTask = {
            id: Date.now().toString(),
            title,
            column: columnName,
            completed: columnName === "Done",
            createdAt: now,
            updatedAt: now
        };
        setTasks(prev => [...prev, newTask]);
    }


    // Move an existing task to a different column (drag-and-drop)
    function moveTask(taskId, newColumn) {
        setTasks(prev =>
            prev.map(t =>
                t.id === taskId
                    ? {
                        ...t,
                        column: newColumn,
                        completed: newColumn === "Done",    // completed is true only in Done column
                        updatedAt: new Date().toISOString()
                    }
                    : t
            )
        );
    }


    // Edit/update an existing task (for now, mainly the title and updateAt date)
    function updateTask(taskId, updates) {
        setTasks(prev =>
            prev.map(t =>
                t.id === taskId
                    ? { ...t, ...updates, updatedAt: new Date().toISOString() }
                    : t
            )
        );
    }

    function toggleTaskComplete(taskId) {
        setTasks(prev =>
            prev.map(t => {
                if (t.id !== taskId) return t;

                const inDone = t.column === "Done";
                const newColumn = inDone ? "To Do" : "Done";    // if already in Done, send back to To Do

                return {
                    ...t,
                    column: newColumn,
                    completed: newColumn === "Done",
                    updatedAt: new Date().toISOString()
                };
            })
        );
    }

    // Permanently remove a task from the board
    function deleteTask(id) {
        setTasks(prev => prev.filter(t => t.id !== id));
    }

    return (
        <div className="kanban-board">
            <h1 className="kanban-title">
                Welcome, {displayName}
            </h1>

            <div className="kanban-columns">
                {columns.map(col => (
                    <KanbanColumn
                        key={col}
                        columnName={col}
                        tasks={tasks.filter(t => t.column === col)}
                        addTask={addTask}
                        moveTask={moveTask}
                        updateTask={updateTask}
                        toggleTaskComplete={toggleTaskComplete}
                        deleteTask={deleteTask}
                    />
                ))}
            </div>
        </div>
    );
}
