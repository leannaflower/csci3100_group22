const BASE_URL = "http://8.217.112.161:8000";

function authHeader() {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("Not logged in");
    return { Authorization: `Bearer ${token}` };
}

export async function fetchLicenseStatus() {
    const res = await fetch(`${BASE_URL}/license/status`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...authHeader(),
        },
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to check licence status");
    }
    return data;
}

export async function activateLicenseKey(key) {
    const res = await fetch(`${BASE_URL}/license/activate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeader(),
        },
        body: JSON.stringify({ key }),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
        throw new Error(data.detail || data.message || "Licence activation failed");
    }
    return data;
}

export async function activateLicenseFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/license/activate-file`, {
        method: "POST",
        headers: {
            ...authHeader(),
        },
        body: formData,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
        throw new Error(data.detail || data.message || "Licence file activation failed");
    }
    return data;
}
