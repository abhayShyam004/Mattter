import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Initialize user from local storage if available for instant load
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token'));
    // If we have a token but no user cache, we need to load. 
    // If no token, we are guaranteed anonymous (not loading).
    const [loading, setLoading] = useState(!!token && !user); // Fix infinite spinner for anonymous users

    // Configure axios defaults
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    }

    useEffect(() => {
        const initAuth = async () => {
            // If user is already loaded from localStorage, skip the API call
            // This dramatically improves performance with remote databases
            if (user) {
                setLoading(false);
                return;
            }

            if (token) {
                try {
                    // Verify token and get user details
                    // Add timeout to prevent infinite hanging
                    const response = await axios.get(`${API_BASE_URL}/api/profiles/me/`, { timeout: 10000 });
                    const userData = response.data;

                    // FORCE role to ADMIN if user is staff or superuser
                    if (userData.is_staff || userData.is_superuser) {
                        userData.role = 'ADMIN';
                    }

                    setUser(userData);
                    // Update local storage
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (error) {
                    console.error("Auth init failed:", error);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []); // Remove token from dependency array to prevent re-running on login

    const login = async (username, password) => {
        try {
            // Add timeout to prevent hanging
            const response = await axios.post(`${API_BASE_URL}/api/login/`, { username, password }, { timeout: 10000 });
            const { token: newToken, user: userData } = response.data;

            localStorage.setItem('token', newToken);
            setToken(newToken);
            axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;

            // We combine the base user data from login with profile data
            try {
                // Add timeout here as well
                const profileRes = await axios.get(`${API_BASE_URL}/api/profiles/me/`, { timeout: 10000 });
                // Merge, prioritizing profile data but keeping is_staff from login response
                const mergedUser = { ...profileRes.data, is_staff: userData.is_staff };

                // FORCE role to ADMIN if user is staff or superuser
                if (mergedUser.is_staff || mergedUser.is_superuser) {
                    mergedUser.role = 'ADMIN';
                }

                setUser(mergedUser);
                localStorage.setItem('user', JSON.stringify(mergedUser));
                return mergedUser;
            } catch (err) {
                // If profile fetch fails (e.g. pure admin without profile), use basic user data
                console.warn("Could not fetch profile, using basic auth data", err);

                // Ensure admin role on fallback too
                if (userData.is_staff || userData.is_superuser) {
                    userData.role = 'ADMIN';
                }

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/register/`, userData);
            const { token: newToken } = response.data;

            localStorage.setItem('token', newToken);
            setToken(newToken);
            axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;

            // Fetch user profile
            const profileRes = await axios.get(`${API_BASE_URL}/api/profiles/me/`);
            const newUser = profileRes.data;
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            return true;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-dark-bg">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
