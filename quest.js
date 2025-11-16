const weburl="http://8.217.112.161:8000";
const login = async (username, password) => {
  try {
    const response = await fetch(`${weburl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    // if login failed
    if (!response.ok) {
      throw new Error(data.detail || "login failed");
    }

    //Save JWT
    saveToken(data.access_token);
    }catch (error) {
    console.error("login failed", error.message);
    throw error;
  }
};