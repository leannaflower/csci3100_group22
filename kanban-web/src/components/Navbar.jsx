import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ darkMode, setDarkMode }) {
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
                    Sprintify
                </Link>
            </div>

            <div className="navbar-right">
                {/* <button
                    type="button"
                    className="darkmode-toggle"
                    onClick={() => setDarkMode((v) => !v)}
                >
                    {darkMode ? "Light mode" : "Dark mode"}
                </button> */}
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