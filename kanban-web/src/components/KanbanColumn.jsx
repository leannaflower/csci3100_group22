// KanbanColumn.jsx — One column in the Kanban board

import React, { useState } from "react";
import KanbanCard from "./KanbanCard";

export default function KanbanColumn({
    columnName,
    tasks,
    addTask,
    moveTask,
    updateTask,
    toggleTaskComplete,
    deleteTask
}) {
    const [newTaskTitle, setNewTaskTitle] = useState("");   // Local state for the "add new task" input
    const [isDragOver, setIsDragOver] = useState(false);    // Track whether a card is currently dragged over this column

    function allowDrop(e) { // Required so dropping is allowed
        e.preventDefault();
    }

    function handleDragEnter(e) {
        e.preventDefault();
        setIsDragOver(true);
    }

    function handleDragLeave(e) {
        setIsDragOver(false);
    }

    function handleDrop(e) {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("text/plain");
        moveTask(taskId, columnName);
        setIsDragOver(false);
    }

    // Add a new task in this column
    function handleAddTask(e) {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        addTask(columnName, newTaskTitle.trim());
        setNewTaskTitle("");
    }

    return (
        <div
            className={`kanban-column ${isDragOver ? "kanban-column-drag-over" : ""}`}
            onDrop={handleDrop}
            onDragOver={allowDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            <h2 className="kanban-column-title">{columnName}</h2>

            <div className="kanban-task-list">
                {tasks.map(task => (
                    <KanbanCard
                        key={task.id}
                        task={task}
                        deleteTask={deleteTask}
                        onUpdate={(updates) => updateTask(task.id, updates)}
                        onToggleComplete={() => toggleTaskComplete(task.id)}
                    />
                ))}
            </div>

            <form className="kanban-add-task" onSubmit={handleAddTask}>
                <input
                    type="text"
                    placeholder="Add task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                />
            </form>
        </div>
    );
}
