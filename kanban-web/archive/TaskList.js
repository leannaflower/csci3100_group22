import React from 'react';
import './TaskList.css';
import TaskItem from './TaskItem';

function TaskList({ tasks, onDelete, onToggleComplete, onEdit }) {
    const completedTasks = tasks.filter((task) => task.completed);
    const activeTasks = tasks.filter((task) => !task.completed);

    if (tasks.length === 0) {
        return (
            <div className="task-list-empty">
                <div className="empty-icon">📝</div>
                <h3>No tasks yet</h3>
                <p>Create your first task to get started!</p>
            </div>
        );
    }

    return (
        <div className="task-list">
            {activeTasks.length > 0 && (
                <div className="task-section">
                    <h2 className="section-title">
                        Active Tasks <span className="badge">{activeTasks.length}</span>
                    </h2>
                    <div className="tasks-container">
                        {activeTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onDelete={onDelete}
                                onToggleComplete={onToggleComplete}
                                onEdit={onEdit}
                            />
                        ))}
                    </div>
                </div>
            )}

            {completedTasks.length > 0 && (
                <div className="task-section">
                    <h2 className="section-title">
                        Completed Tasks <span className="badge completed">{completedTasks.length}</span>
                    </h2>
                    <div className="tasks-container">
                        {completedTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onDelete={onDelete}
                                onToggleComplete={onToggleComplete}
                                onEdit={onEdit}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TaskList;

