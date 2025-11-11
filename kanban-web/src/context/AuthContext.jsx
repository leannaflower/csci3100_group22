import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    function handleAuthSuccess(payload) {
        setUser(payload.user);
        setAccessToken(payload.accessToken);
    }

    function logout() {
        setUser(null);
        setAccessToken(null);
    }

    return (
        <AuthContext.Provider value={{ user, accessToken, handleAuthSuccess, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
