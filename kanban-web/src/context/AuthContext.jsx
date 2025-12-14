import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, fetchCurrentUser } from "../api/authClient";
import { fetchLicenseStatus } from "../api/licenseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(
        localStorage.getItem("access_token") || null
    );
    const [licensed, setLicensed] = useState(false);

    async function refreshLicenseStatus() {
        try {
            const status = await fetchLicenseStatus();
            setLicensed(Boolean(status.licensed));
            return status;
        } catch (e) {
            setLicensed(false);
            return { licensed: false };
        }
    }

    // Load user if token exists (page refresh)
    useEffect(() => {
        if (!accessToken) {
            setUser(null);
            setLicensed(false);
            return;
        }

        (async () => {
            try {
                const me = await fetchCurrentUser(accessToken);
                setUser(me);

                await refreshLicenseStatus();
            } catch (e) {
                setUser(null);
                setLicensed(false);
                setAccessToken(null);
                localStorage.removeItem("access_token");
            }
        })();
    }, [accessToken]);

    async function login(email, password) {
        const res = await loginUser({ email, password });

        if (res.access_token) {
            localStorage.setItem("access_token", res.access_token);
            setAccessToken(res.access_token);

            const me = await fetchCurrentUser(res.access_token);
            setUser(me);

            await refreshLicenseStatus();
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

            await refreshLicenseStatus();
        }

        return res;
    }

    function logout() {
        setUser(null);
        setLicensed(false);
        setAccessToken(null);
        localStorage.removeItem("access_token");
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                licensed,
                refreshLicenseStatus,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
