import React, { createContext, useContext, useState } from "react";

// This is our auth context—it holds onto user info and tokens across the whole app
const AuthContext = createContext(null);

// This component wraps around our app and gives all its children access to auth state.
// Wrap our app with this, and any child component can grab user info and login/logout functions.
export function AuthProvider({ children }) {
    // Keep track of who's logged in
    const [user, setUser] = useState(null);
    // Keep track of their access token (needed to talk to the backend)
    const [accessToken, setAccessToken] = useState(null);

    // Call this when login/signup is successful
    // It stores the user info and token so the whole app knows they're logged in
    function handleAuthSuccess(payload) {   // payload should look like: { user: { id, name, email, ... }, accessToken: "token_string" }
        setUser(payload.user);
        setAccessToken(payload.accessToken);
    }

    // Call this when the user logs out
    // It clears everything so they're no longer logged in
    function logout() {
        setUser(null);
        setAccessToken(null);
    }

    // Share the auth state and functions with all child components
    return (
        <AuthContext.Provider value={{ user, accessToken, handleAuthSuccess, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Use this hook in any component that needs auth info (user, token, etc.)
// It grabs the stuff from AuthContext and gives it to you—just make sure you're inside AuthProvider!
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
