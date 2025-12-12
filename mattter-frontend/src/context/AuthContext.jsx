import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    }

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    // Verify token and get user details
                    const response = await axios.get(`${API_BASE_URL}/api/profiles/me/`);
                    setUser(response.data);
                } catch (error) {
                    console.error("Auth init failed:", error);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/login/`, { username, password });
            const { token: newToken } = response.data;

            localStorage.setItem('token', newToken);
            setToken(newToken);
            axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;

            // Fetch user profile immediately
            const profileRes = await axios.get(`${API_BASE_URL}/api/profiles/me/`);
            setUser(profileRes.data);
            return profileRes.data; // Return user data for redirect logic
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
            setUser(profileRes.data);
            return true;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
