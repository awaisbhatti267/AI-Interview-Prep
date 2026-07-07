import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute"

// Auth pages
import Login from "./Pages/Auth/Login"
import Signup from "./Pages/Auth/Signup"
import ForgotPassword from "./Pages/Auth/ForgotPassword"
import ResetPassword from "./Pages/Auth/ResetPassword"
import VerifyOtp from "./Pages/Auth/VerifyOtp"

// App pages
import Dashboard from "./Pages/Dashboard"
import Resume from "./Pages/Resume"
import PracticeInterview from "./Pages/PracticeInterview"
import History from "./Pages/History"
import Performance from "./Pages/Performance"
import WeakTopics from "./Pages/WeakTopics"
import Bookmarks from "./Pages/Bookmarks"
import Settings from "./Pages/Settings"

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login"            element={<Login />} />
        <Route path="/signup"           element={<Signup />} />
        <Route path="/verify-otp"       element={<VerifyOtp />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/reset-password"   element={<ResetPassword />} />

        {/* Protected app routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/resume"            element={<ProtectedRoute><Resume /></ProtectedRoute>} />
        <Route path="/practice_interview" element={<ProtectedRoute><PracticeInterview /></ProtectedRoute>} />
        <Route path="/history"           element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/performance"       element={<ProtectedRoute><Performance /></ProtectedRoute>} />
        <Route path="/weak_topics"       element={<ProtectedRoute><WeakTopics /></ProtectedRoute>} />
        <Route path="/bookmarks"         element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
        <Route path="/settings"          element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App
