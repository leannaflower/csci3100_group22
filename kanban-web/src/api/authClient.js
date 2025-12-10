// src/api/authClient.js

const BASE_URL = "http://8.217.112.161:8000";

async function apiRequest(endpoint, method, data = null, token = null) {
    const url = `${BASE_URL}${endpoint}`;

    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    config.signal = controller.signal;

    try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        const responseText = await response.text();
        const actionName = endpoint.split("/").pop().toUpperCase().replace("-", " ");
        console.log(`${actionName} status:`, response.status, responseText);

        if (!response.ok) {
            let errorPayload;
            try {
                errorPayload = JSON.parse(responseText);
            } catch {
                errorPayload = { raw: responseText };
            }

            const msgFromBackend =
                errorPayload.detail ||
                errorPayload.message ||
                JSON.stringify(errorPayload);

            throw new Error(
                `Request to ${endpoint} failed (${response.status}): ${msgFromBackend}`
            );
        }

        try {
            return JSON.parse(responseText);
        } catch {
            return responseText;
        }
    } catch (error) {
        if (error.name === "AbortError") {
            console.error(`Request to ${endpoint} timed out`);
            throw new Error(`Request to ${endpoint} timed out`);
        }
        console.error(`Error calling ${endpoint}:`, error);
        throw error;
    }
}

// Register user, returns { access_token, refresh_token, ... }
export async function registerUser({ email, password }) {
    const payload = {
        username: email, // backend uses "username", but we let user type email
        email,
        password,
    };
    return apiRequest("/auth/register", "POST", payload);
}

// Login user, returns { access_token, refresh_token, ... }
export async function loginUser({ email, password }) {
    const payload = {
        username: email, // backend expects "username" field
        password,
    };
    return apiRequest("/auth/login", "POST", payload);
}

// Refresh tokens using refresh_token
export async function refreshToken(refreshToken) {
    const payload = {
        refresh_token: refreshToken,
    };

    return apiRequest("/auth/refresh", "POST", payload);
}

// Fetch currently logged in user using access token
export async function fetchCurrentUser(accessToken) {
    return apiRequest("/users/me", "GET", null, accessToken);
}
