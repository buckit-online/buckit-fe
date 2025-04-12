import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Loading...</p>; // Placeholder loading message or you can add a spinner
    }

    // If the user is authenticated, render the children (protected route content)
    // If the user is not authenticated, navigate to login page
    return user ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
