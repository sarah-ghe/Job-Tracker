import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Try to fetch user data with the stored token
          const userData = await authService.getCurrentUser();
          setCurrentUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // If the token is invalid, remove it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      // Call the authentication service
      const response = await authService.login(email, password);
      
      // Store the token
      localStorage.setItem('token', response.access_token);
      
      // Fetch user data after successful login
      const userData = await authService.getCurrentUser();
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      // Call the signup service
      const response = await authService.signup(userData);
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Context value
  const value = {
    currentUser,
    login,
    logout,
    signup,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};