import axios from 'axios';

// Create an axios instance with base URL
const API_URL = 'http://localhost:8000'; // Adjust this to your backend URL

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth services
export const authService = {
    login: async (email, password) => {
        const response = await api.post('/token', { username: email, password });
        return response.data;
    },

    signup: async (userData) => {
        const response = await api.post('/users/', userData);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },
};

// User profile services
export const userService = {
    getProfile: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    updateProfile: async (userData) => {
        const response = await api.put('/users/me', userData);
        return response.data;
    },
};

export default api;