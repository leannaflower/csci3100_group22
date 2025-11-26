// src/context/AuthContext.jsx

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    fetchCurrentUser,
    refreshToken as apiRefreshToken,
} from "../api/authClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(
        () => localStorage.getItem("accessToken") || null
    );
    const [refreshToken, setRefreshToken] = useState(
        () => localStorage.getItem("refreshToken") || null
    );
    const [loadingUser, setLoadingUser] = useState(false);

    // Load current user if we already have a token (page refresh)
    useEffect(() => {
        const loadUser = async () => {
            if (!accessToken || user) return;

            setLoadingUser(true);
            try {
                const me = await fetchCurrentUser(accessToken);
                setUser({
                    id: me.id,
                    email: me.username,
                    displayName: me.username, // backend only has username now
                    status: me.status,
                });
            } catch (err) {
                console.error("Failed to fetch current user:", err);
                setUser(null);
                setAccessToken(null);
                setRefreshToken(null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
            } finally {
                setLoadingUser(false);
            }
        };

        loadUser();
    }, [accessToken, user]);

    // Called after login or register
    async function handleAuthSuccess(tokenPayload) {
        const access =
            tokenPayload.access_token ||
            tokenPayload.accessToken ||
            null;
        const refresh =
            tokenPayload.refresh_token ||
            tokenPayload.refreshToken ||
            null;

        if (!access) {
            console.error("handleAuthSuccess called without access token", tokenPayload);
            return;
        }

        setAccessToken(access);
        localStorage.setItem("accessToken", access);

        if (refresh) {
            setRefreshToken(refresh);
            localStorage.setItem("refreshToken", refresh);
        }

        // Get user info from /users/me
        try {
            setLoadingUser(true);
            const me = await fetchCurrentUser(access);
            setUser({
                id: me.id,
                email: me.username,
                displayName: me.username,
                status: me.status,
            });
        } catch (err) {
            console.error("Failed to fetch user after auth:", err);
            setUser(null);
        } finally {
            setLoadingUser(false);
        }
    }

    async function refreshSession() {
        if (!refreshToken) return;

        try {
            const tokens = await apiRefreshToken(refreshToken);
            await handleAuthSuccess(tokens);
        } catch (err) {
            console.error("Failed to refresh session:", err);
            logout();
        }
    }

    function logout() {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                refreshToken,
                loadingUser,
                handleAuthSuccess,
                refreshSession,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
}
