import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load token and user email from localStorage on app start
        const storedToken = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));

        if (storedToken) {
            setToken(storedToken);
            setUser(storedUser); // Load user email
        }
        setLoading(false);
    }, []);

    const login = (newToken, userEmail) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify({ email: userEmail }));
        setToken(newToken);
        setUser({ email: userEmail });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
