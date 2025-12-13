import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, fetchCurrentUser } from "../api/authClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("access_token") || null
    );

    // Load user if token exists
    useEffect(() => {
        if (!accessToken) return;

        fetchCurrentUser(accessToken)
            .then((data) => setUser(data))
            .catch(() => {
                setUser(null);
                setAccessToken(null);
                localStorage.removeItem("access_token");
            });
    }, [accessToken]);

    async function login(email, password) {
        const res = await loginUser({ email, password });

        if (res.access_token) {
            localStorage.setItem("access_token", res.access_token);
            setAccessToken(res.access_token);

            // Fetch /users/me
            const me = await fetchCurrentUser(res.access_token);
            setUser(me);
        }
        return res;
    }

    async function register({ username, email, password }) {
        const res = await registerUser({ username, email, password });

        if (res.access_token) {
            localStorage.setItem("access_token", res.access_token);
            setAccessToken(res.access_token);

            const me = await fetchCurrentUser(res.access_token);
            setUser(me);
        }

        return res;
    }

    function logout() {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("access_token");
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
