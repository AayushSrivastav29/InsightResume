import { useState, useContext } from "react";
import NavBar from "./components/NavBar";
import "./App.css";
import HomePage from "./pages/HomePage";
import { Route, Routes, Navigate } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ResumeUploadPage from "./pages/ResumeUploadPage";
import JobAnalysisPage from "./pages/JobAnalysisPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ViewAnalysisPage from "./pages/ViewAnalysisPage";
import { UserContext } from "./UserContext";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/signup" replace />;
}

function App() {
  const { isAuthenticated } = useContext(UserContext);

  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <ResumeUploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analyze"
          element={
            <ProtectedRoute>
              <JobAnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-analysis/:analysisId"
          element={
            <ProtectedRoute>
              <ViewAnalysisPage />
            </ProtectedRoute>
          }
        />
        {/* Catch all route - redirect to appropriate page */}
        {/* <Route 
          path="*" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/" replace />
          } 
        /> */}
      </Routes>
    </div>
  );
}

export default App;
