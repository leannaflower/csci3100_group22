// KanbanCard.jsx — A single draggable task card with inline editing

import React, { useState } from "react";

export default function KanbanCard({ task, deleteTask, onUpdate, onToggleComplete }) {
    const [isDragging, setIsDragging] = useState(false);    // Visual state for drag feedback
    const [isEditing, setIsEditing] = useState(false);      // Editing state
    const [editTitle, setEditTitle] = useState(task.title); // Editing state

    function handleDragStart(e) {
        // Do not start drag when in edit mode
        if (isEditing) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
        setIsDragging(true);
    }

    function handleDragEnd() {
        setIsDragging(false);
    }

    // Start editing this card
    function handleEditClick() {
        setEditTitle(task.title); // reset to current title
        setIsEditing(true);
    }

    // Cancel editing, do not change the task
    function handleCancelEdit() {
        setIsEditing(false);
        setEditTitle(task.title);
    }

    // Save the edited title and notify parent
    function handleSaveEdit(e) {
        e.preventDefault();
        const trimmed = editTitle.trim();
        if (!trimmed) return; // do not save empty

        // Call parent-provided update function
        onUpdate({ title: trimmed });

        setIsEditing(false);
    }

    // If in editing mode, show the small inline form instead of normal card
    if (isEditing) {
        return (
            <div className="kanban-card kanban-card-editing">
                <form onSubmit={handleSaveEdit} className="kanban-edit-form">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="kanban-edit-input"
                        autoFocus
                    />
                    <div className="kanban-edit-actions">
                        <button type="submit" className="kanban-edit-save">
                            Save
                        </button>
                        <button
                            type="button"
                            className="kanban-edit-cancel"
                            onClick={handleCancelEdit}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Normal (non-editing) card with drag + edit + delete
    return (
        <div
            className={
                "kanban-card" +
                (isDragging ? " kanban-card-dragging" : "") +
                (task.completed ? " kanban-card-completed" : "")
            }
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-card-main">
                {/* Checkbox appears on hover via CSS */}
                <input
                    type="checkbox"
                    className="kanban-card-checkbox"
                    checked={!!task.completed}
                    onChange={onToggleComplete}
                    onClick={(e) => e.stopPropagation()}
                />

                <div className="kanban-card-body">
                    <p className="kanban-card-title">{task.title}</p>
                </div>

                {/* Edit and delete appear on hover via CSS */}
                <div className="kanban-card-actions">
                    <button
                        type="button"
                        className="kanban-card-edit"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick();
                        }}
                    >
                        Edit
                    </button>
                    <button
                        className="kanban-card-delete"
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task.id);
                        }}
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}
