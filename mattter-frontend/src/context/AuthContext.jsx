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
                    const userData = response.data;

                    // FORCE role to ADMIN if user is staff or superuser
                    if (userData.is_staff || userData.is_superuser) {
                        userData.role = 'ADMIN';
                    }

                    setUser(userData);
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
            const { token: newToken, user: userData } = response.data;

            localStorage.setItem('token', newToken);
            setToken(newToken);
            axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;

            // We combine the base user data from login with profile data
            try {
                const profileRes = await axios.get(`${API_BASE_URL}/api/profiles/me/`);
                // Merge, prioritizing profile data but keeping is_staff from login response
                const mergedUser = { ...profileRes.data, is_staff: userData.is_staff };

                // FORCE role to ADMIN if user is staff or superuser
                if (mergedUser.is_staff || mergedUser.is_superuser) {
                    mergedUser.role = 'ADMIN';
                }

                setUser(mergedUser);
                return mergedUser;
            } catch (err) {
                // If profile fetch fails (e.g. pure admin without profile), use basic user data
                console.warn("Could not fetch profile, using basic auth data", err);

                // Ensure admin role on fallback too
                if (userData.is_staff || userData.is_superuser) {
                    userData.role = 'ADMIN';
                }

                setUser(userData);
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
            {loading ? (
                <div className="flex justify-center items-center h-screen bg-dark-bg">
                    <div className="w-12 h-12 border-4 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
