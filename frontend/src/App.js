import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AssignmentsPage from "./pages/AssignmentsPage";
import AttemptPage from "./pages/AttemptPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyAttemptsPage from "./pages/MyAttemptsPage";
import "./styles/global.scss";

// Layout that includes Navbar
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ flex: 1 }}>{children}</main>
  </>
);

// Auth-only layout (no navbar, full screen)
const AuthLayout = ({ children }) => (
  <main style={{ flex: 1 }}>{children}</main>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Auth pages - no navbar */}
            <Route
              path="/login"
              element={
                <AuthLayout>
                  <LoginPage />
                </AuthLayout>
              }
            />
            <Route
              path="/register"
              element={
                <AuthLayout>
                  <RegisterPage />
                </AuthLayout>
              }
            />

            {/* Main app with navbar */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              }
            />
            <Route
              path="/assignments"
              element={
                <MainLayout>
                  <AssignmentsPage />
                </MainLayout>
              }
            />
            <Route
              path="/assignments/:id"
              element={
                <MainLayout>
                  <AttemptPage />
                </MainLayout>
              }
            />
            <Route
              path="/my-attempts"
              element={
                <MainLayout>
                  <MyAttemptsPage />
                </MainLayout>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
