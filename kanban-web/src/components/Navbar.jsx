import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/boards" className="navbar-logo">
                    KanbanBoard (name is tbh)
                </Link>
            </div>

            <div className="navbar-right">
                {user ? (
                    <>
                        <span className="navbar-username">
                            {user.username || user.email}
                        </span>
                        <button onClick={handleLogout} className="navbar-button">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/dev-board" className="navbar-link">
                            Board (DEV MODE)
                        </Link>

                        <Link to="/login" className="navbar-link">
                            Login
                        </Link>
                        <Link to="/register" className="navbar-button">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}