// BoardsPage.jsx
import React, { useState, useEffect } from "react";
import KanbanColumn from "../components/KanbanColumn";
import "../components/Kanban.css";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://8.217.112.161:8000"; // same as authClient

export default function BoardsPage() {
    const { user } = useAuth();

    // All tasks for the current user
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const columns = ["To Do", "Doing", "Done"];

    const displayName =
        user?.username || user?.email || "Guest";

    // Helper: build headers with access token
    function getAuthHeaders() {
        const token = localStorage.getItem("access_token");
        if (!token) {
            throw new Error("No access token found. Please log in again.");
        }
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    }

    // Load tasks from backend on mount
    useEffect(() => {
        async function fetchTasks() {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(`${API_BASE_URL}/api/v1/tasks`, {
                    method: "GET",
                    headers: getAuthHeaders(),
                });

                const json = await res.json();

                if (!res.ok || json.success === false) {
                    throw new Error(json.message || "Failed to load tasks");
                }

                // quest.js expects { success: true, data: [...], count? }
                setTasks(json.data || []);
            } catch (err) {
                console.error("Failed to fetch tasks:", err);
                setError(err.message || "Failed to fetch tasks");
            } finally {
                setLoading(false);
            }
        }

        fetchTasks();
    }, []);

    // Create a new task in a specific column
    async function addTask(columnName, title, description = "") {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/tasks`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title,
                    description: "",
                    column: columnName,
                }),
            });

            const json = await res.json();
            if (!res.ok || json.success === false) {
                throw new Error(json.message || "Failed to create task");
            }

            const created = json.data;
            setTasks(prev => [...prev, created]);
        } catch (err) {
            console.error("Failed to add task:", err);
            alert(err.message || "Failed to add task");
        }
    }

    // Move task to another column (drag and drop)
    async function moveTask(taskId, newColumn) {
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/v1/tasks/${taskId}/move`,
                {
                    method: "PATCH",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ column: newColumn }),
                }
            );

            const json = await res.json();
            if (!res.ok || json.success === false) {
                throw new Error(json.message || "Failed to move task");
            }

            const updated = json.data;
            setTasks(prev =>
                prev.map(t => (t.id === updated.id ? updated : t))
            );
        } catch (err) {
            console.error("Failed to move task:", err);
            alert(err.message || "Failed to move task");
        }
    }

    // Update task fields (e.g., title from inline edit)
    async function updateTask(taskId, updates) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/tasks/${taskId}`, {
                method: "PATCH",
                headers: getAuthHeaders(),
                body: JSON.stringify(updates),
            });

            const json = await res.json();
            if (!res.ok || json.success === false) {
                throw new Error(json.message || "Failed to update task");
            }

            const updated = json.data;
            setTasks(prev =>
                prev.map(t => (t.id === updated.id ? updated : t))
            );
        } catch (err) {
            console.error("Failed to update task:", err);
            alert(err.message || "Failed to update task");
        }
    }

    // Toggle completed (checkbox)
    async function toggleTaskComplete(taskId) {
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/v1/tasks/${taskId}/toggle`,
                {
                    method: "PATCH",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({}), // backend ignores body
                }
            );

            const json = await res.json();
            if (!res.ok || json.success === false) {
                throw new Error(json.message || "Failed to toggle task");
            }

            const updated = json.data;
            setTasks(prev =>
                prev.map(t => (t.id === updated.id ? updated : t))
            );
        } catch (err) {
            console.error("Failed to toggle task:", err);
            alert(err.message || "Failed to toggle task");
        }
    }

    // Delete task
    async function deleteTask(taskId) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/tasks/${taskId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            const json = await res.json();
            if (!res.ok || json.success === false) {
                throw new Error(json.message || "Failed to delete task");
            }

            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            console.error("Failed to delete task:", err);
            alert(err.message || "Failed to delete task");
        }
    }

    return (
        <div className="kanban-board">
            <h1 className="kanban-title">
                Welcome, {displayName}
            </h1>

            {loading && <div>Loading tasks…</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}

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
