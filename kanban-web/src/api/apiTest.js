import { loginUser, registerUser } from './authClient.js';

async function runTests() {
    console.log("=== Testing API Calls ===");

    console.log("\n1. Testing login with correct credentials:");
    try {
        const result = await loginUser({ email: "test", password: "testpwd" });
        console.log("✅ Success:", result);
    } catch (error) {
        console.log("❌ Error:", error.message);
    }

    console.log("\n2. Testing login with wrong password:");
    try {
        const result = await loginUser({ email: "test", password: "wrongpassword" });
        console.log("✅ Success:", result);
    } catch (error) {
        console.log("❌ Error:", error.message);
    }

    console.log("\n3. Testing login with non-existent user:");
    try {
        const result = await loginUser({ email: "nonexistent", password: "anypassword" });
        console.log("✅ Success:", result);
    } catch (error) {
        console.log("❌ Error:", error.message);
    }

    console.log("\n4. Testing registration:");
    try {
        const result = await registerUser({ email: "test1", password: "password" });
        console.log("✅ Success:", result);
    } catch (error) {
        console.log("❌ Error:", error.message);
    }

    console.log("\n=== Tests completed ===");
}

runTests();