import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            await register({ username, email, password });
            navigate("/boards");
        } catch (err) {
            console.error("Register failed:", err);
            setError(err.message || String(err));
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Register</h1>
                <p className="auth-subtitle">Create a new account</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label className="auth-label">
                        Username *
                        <input
                            type="text"
                            className="auth-input"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </label>

                    <label className="auth-label">
                        Email *
                        <input
                            type="email"
                            className="auth-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label className="auth-label">
                        Password *
                        <input
                            type="password"
                            className="auth-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </label>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="auth-button">
                        Register
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{" "}
                    <Link to="/login" className="auth-link">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
