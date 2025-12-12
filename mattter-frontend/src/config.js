// API Configuration
// This file provides a single source of truth for the API base URL
// It automatically uses the correct URL based on the environment

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export { API_BASE_URL };
