import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/boards");
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Login</h1>
                <p className="auth-subtitle">Sign in to access your boards.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label className="auth-label">
                        Email
                        <input
                            type="text"
                            className="auth-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label className="auth-label">
                        Password
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
                        Log in
                    </button>
                </form>

                <p className="auth-switch">
                    No account yet?{" "}
                    <Link to="/register" className="auth-link">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}