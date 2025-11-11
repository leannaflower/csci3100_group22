import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/authClient";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
    const { handleAuthSuccess } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        try {
            const data = await registerUser({ email, password, displayName });
            handleAuthSuccess(data);
            navigate("/boards");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Create account</h1>
                <p className="auth-subtitle">Join to start managing your projects.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label className="auth-label">
                        Display name
                        <input
                            type="text"
                            className="auth-input"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            required
                        />
                    </label>

                    <label className="auth-label">
                        Email
                        <input
                            type="email"
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
