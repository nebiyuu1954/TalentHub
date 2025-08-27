import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import AdminLandingPage from './pages/AdminLandingPage/AdminLandingPage';
import EmployerLandingPage from './pages/EmployerLandingPage/EmployerLandingPage';
import ApplicantLandingPage from './pages/ApplicantLandingPage/ApplicantLandingPage';
import Login from './pages/Auth/Login/Login';
import Signup from './pages/Auth/SignUp/SignUp';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/admin-landing"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLandingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer-landing"
        element={
          <ProtectedRoute allowedRole="employer">
            <EmployerLandingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applicant-landing"
        element={
          <ProtectedRoute allowedRole="applicant">
            <ApplicantLandingPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}