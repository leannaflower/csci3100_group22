// This file handles all auth-related API calls (login, register, etc.)
// It talks to the backend server to authenticate users

// Where the backend lives
const API_BASE = "http://localhost:8000/api/v1";

// Helper function to make requests to the backend
// Handles JSON encoding, error checking, and common headers

async function request(path, options = {}) {
    // options: optional object to customize the request (method, body, headers, credentials, etc.)
    // example: request("/auth/login", { method: "POST", body: JSON.stringify({...}) })
    // Build the full URL and make the fetch request
    const res = await fetch(`${API_BASE}${path}`, {
        // Always send JSON by default, but let callers override headers if needed
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    });

    // Try to parse the response as JSON
    const data = await res.json().catch(() => ({}));

    // If the request failed, throw an error with a message
    if (!res.ok) throw new Error(data.detail || data.message || "Request failed");

    return data;
}

// Sign up a new user
// Takes email, password, and display name
// Returns user info and access token if successful (use this with handleAuthSuccess!)
export async function registerUser({ email, password, displayName }) {
    return request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, displayName }),
    });
}

// Log in an existing user
// Takes email and password
// Returns user info and access token if successful (use this with handleAuthSuccess!)
export async function loginUser({ email, password }) {
    return request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}
