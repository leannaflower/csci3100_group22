import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { activateLicenseKey, activateLicenseFile } from "../api/licenseClient";

export default function LicensePage() {
    const { refreshLicenseStatus } = useAuth();
    const navigate = useNavigate();

    const [key, setKey] = useState("");
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleKeySubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await activateLicenseKey(key);
            await refreshLicenseStatus();
            navigate("/boards");
        } catch (err) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    }

    async function handleFileSubmit(e) {
        e.preventDefault();
        if (!file) return;
        setError("");
        setLoading(true);
        try {
            await activateLicenseFile(file);
            await refreshLicenseStatus();
            navigate("/boards");
        } catch (err) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Activate licence</h1>
                <p className="auth-subtitle">
                    Enter a valid licence key to access the system.
                </p>

                <form onSubmit={handleKeySubmit} className="auth-form">
                    <label className="auth-label">
                        Licence key
                        <input
                            className="auth-input"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="AAAA-BBBB-CCCC-DDDD"
                            required
                        />
                    </label>

                    {error && <div className="auth-error">{error}</div>}

                    <button className="auth-button" type="submit" disabled={loading}>
                        Activate key
                    </button>
                </form>

                <div style={{ height: 16 }} />

                <form onSubmit={handleFileSubmit} className="auth-form">
                    <label className="auth-label">
                        Or upload a licence key file
                        <input
                            type="file"
                            accept=".txt"
                            className="auth-input"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </label>

                    <button className="auth-button" type="submit" disabled={loading || !file}>
                        Upload and activate
                    </button>
                </form>
            </div>
        </div>
    );
}
