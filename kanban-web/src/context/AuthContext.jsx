// import React, { createContext, useContext, useState } from "react";

// // This is our auth context—it holds onto user info and tokens across the whole app
// const AuthContext = createContext(null);

// // This component wraps around our app and gives all its children access to auth state.
// // Wrap our app with this, and any child component can grab user info and login/logout functions.
// export function AuthProvider({ children }) {
//     // Keep track of who's logged in
//     const [user, setUser] = useState(null);
//     // Keep track of their access token (needed to talk to the backend)
//     const [accessToken, setAccessToken] = useState(null);

//     // Call this when login/signup is successful
//     // It stores the user info and token so the whole app knows they're logged in
//     function handleAuthSuccess(payload) {   // payload should look like: { user: { id, name, email, ... }, accessToken: "token_string" }
//         setUser(payload.user);
//         setAccessToken(payload.accessToken);
//     }

//     // async function handleAuthSuccess(tokenPayload) {
//     //     console.log("handleAuthSuccess payload:", tokenPayload);

//     //     const access =
//     //         tokenPayload.access_token ||
//     //         tokenPayload.accessToken ||
//     //         null;
//     //     const refresh =
//     //         tokenPayload.refresh_token ||
//     //         tokenPayload.refreshToken ||
//     //         null;

//     //     if (!access) {
//     //         console.error("handleAuthSuccess called without access token", tokenPayload);
//     //         return;
//     //     }

//     //     setAccessToken(access);
//     //     localStorage.setItem("accessToken", access);

//     //     if (refresh) {
//     //         setRefreshToken(refresh);
//     //         localStorage.setItem("refreshToken", refresh);
//     //     }

//     //     try {
//     //         setLoadingUser(true);
//     //         const me = await fetchCurrentUser(access);
//     //         console.log("Fetched /users/me:", me);
//     //         setUser({
//     //             id: me.id,
//     //             email: me.username,
//     //             displayName: me.username,
//     //             status: me.status,
//     //         });
//     //     } catch (err) {
//     //         console.error("Failed to fetch user after auth:", err);
//     //         setUser(null);
//     //     } finally {
//     //         setLoadingUser(false);
//     //     }
//     // }

//     // Call this when the user logs out
//     // It clears everything so they're no longer logged in
//     function logout() {
//         setUser(null);
//         setAccessToken(null);
//     }

//     // Share the auth state and functions with all child components
//     return (
//         <AuthContext.Provider value={{ user, accessToken, handleAuthSuccess, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }

// // Use this hook in any component that needs auth info (user, token, etc.)
// // It grabs the stuff from AuthContext and gives it to you—just make sure you're inside AuthProvider!
// export function useAuth() {
//     const ctx = useContext(AuthContext);
//     if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//     return ctx;
// }

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

    async function register(email, password) {
        const res = await registerUser({ email, password });

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
