// API helper

const API_BASE = "http://localhost:8000/api/v1";

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(data.detail || data.message || "Request failed");

    return data;
}

export async function registerUser({ email, password, displayName }) {
    return request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, displayName }),
    });
}

export async function loginUser({ email, password }) {
    return request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}
