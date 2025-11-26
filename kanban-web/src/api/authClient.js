// src/api/authClient.js

const BASE_URL = "http://8.217.112.161:8000";

async function apiRequest(endpoint, method, data = null, token = null) {
    const url = `${BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    // 设置超时 (模拟 timeout=10)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    config.signal = controller.signal;

    try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // 获取响应文本用于打印日志
        const responseText = await response.text();

        // 打印状态 (对应 Python 的 print("STATUS:", ...))
        // 将 endpoint 转换为大写动作名以便日志美观
        const actionName = endpoint.split('/').pop().toUpperCase().replace('-', ' ');
        console.log(`${actionName} status:`, response.status, responseText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
        }

        // 尝试解析 JSON
        try {
            return JSON.parse(responseText);
        } catch (e) {
            return responseText; // 如果不是 JSON，返回文本
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error(`Request to ${endpoint} timed out`);
        }
        throw error;
    }
}

// 生成随机字符串
function rand_str(n = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < n; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


// Register user, returns { access_token, refresh_token, ... }
export async function registerUser({ email, password }) {
    // we will treat email as both username and email for now
    const payload = {
        username: email,
        email: email,
        password: password,
        // code: "123456" if you ever need it later
    };
    // if (code !== null) {
    //     payload["code"] = code;
    // }

    return await apiRequest("/auth/register", "POST", payload);
}

// Login user, returns { access_token, refresh_token, ... }
export async function loginUser({ email, password }) {
    const payload = {
        username: email, // backend uses "username" field but it can be an email
        password: password,
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
