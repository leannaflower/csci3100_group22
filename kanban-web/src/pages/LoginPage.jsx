import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/authClient";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { handleAuthSuccess } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        // e.preventDefault();
        // setError("");
        // try {
        //     const data = await loginUser({ email, password });

        //     // Optional: keep token for refresh
        //     if (data.access_token) {
        //         localStorage.setItem("token", data.access_token);
        //     }

        //     // Try to recover a display name from localStorage (from registration)
        //     const storedName = localStorage.getItem("userDisplayName");

        //     // Build a payload that AuthContext knows how to read
        //     const payload = {
        //         ...data,             // access_token, token_type, etc.
        //         email,               // we know what the user typed
        //         displayName: storedName || null,
        //     };

        //     handleAuthSuccess(payload);
        //     navigate("/boards");
        // } catch (err) {
        //     setError(err.message);
        // }

        e.preventDefault();
        setError("");

        try {
            const tokens = await loginUser({ email, password });
            // tokens has access_token and refresh_token

            await handleAuthSuccess(tokens);  // will set user and tokens, call /users/me

            navigate("/boards");
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.message || String(err));
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Kanban Login</h1>
                <p className="auth-subtitle">Sign in to access your boards.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label className="auth-label">
                        Email or Username
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