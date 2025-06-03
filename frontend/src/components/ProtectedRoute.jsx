import { Navigate } from 'react-router-dom';

// This component checks if the user is authenticated
// If authenticated, it renders the protected component
// If not, it redirects to the login page
const ProtectedRoute = ({ element }) => {
  // Check if user is logged in
  // For now, we'll use localStorage, but in a real app,
  // you might use a more sophisticated auth state management
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  // If authenticated, render the protected component
  // Otherwise, redirect to login page
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;