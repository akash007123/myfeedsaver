import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute: React.FC = () => {
  // Get user, token, and loading state from context
  const { user, token, isLoading } = useAuth();

  // 1. If still loading the auth state, don't render anything yet (or show a loader)
  if (isLoading) {
    console.log("PrivateRoute: Auth state is loading...");
    return null; // Or return a loading spinner component
  }

  // 2. Once loading is complete, check for user/token
  // Checking for token is generally more robust for persistence check
  console.log("PrivateRoute: Loading finished. Token:", token ? 'Exists' : 'None', "User:", user ? 'Exists' : 'None');
  return token ? <Outlet /> : <Navigate to="/login" replace />; // Redirect if no token
  // Using 'replace' in Navigate prevents the login page from being added to history
  // when the user is redirected because they weren't authenticated.
};

export default PrivateRoute;
