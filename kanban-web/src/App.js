import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/Navbar";
import BoardsPage from "./pages/BoardsPage";
import LicensePage from "./pages/LicensePage";

function AppRoutes({ darkMode, setDarkMode }) {
  const { user, licensed } = useAuth();

  return (
    <>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/boards"
          element={
            user ? (
              licensed ? (
                <BoardsPage />
              ) : (
                <Navigate to="/license" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/license"
          element={user ? <LicensePage /> : <Navigate to="/login" replace />}
        />

        <Route path="/dev-board" element={<BoardsPage />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <button
        type="button"
        className="theme-fab"
        onClick={() => setDarkMode((v) => !v)}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={darkMode ? "Light mode" : "Dark mode"}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>
    </>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : false;
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes darkMode={darkMode} setDarkMode={setDarkMode} />
      </BrowserRouter>
    </AuthProvider>
  );
}
