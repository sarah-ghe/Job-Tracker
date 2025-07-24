import axios from 'axios';

// 1. Création d'une instance axios avec une configuration de base
const API_URL = 'http://localhost:8000'; // L'URL de votre backend FastAPI

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Intercepteur pour ajouter automatiquement le token d'authentification à chaque requête
api.interceptors.request.use(
    (config) => {
        // Récupération du token depuis le localStorage
        const token = localStorage.getItem('token');

        // Si un token existe, l'ajouter à l'en-tête Authorization
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Intercepteur pour gérer les réponses et les erreurs globalement
api.interceptors.response.use(
    (response) => {
        // Traitement des réponses réussies
        return response;
    },
    (error) => {
        // Gestion des erreurs de réponse
        if (error.response && error.response.status === 401) {
            // Si le serveur renvoie une erreur 401 (non autorisé), déconnecter l'utilisateur
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Rediriger vers la page de connexion si nécessaire
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// 4. Services d'authentification
export const authService = {
    // Connexion utilisateur
    login: async (email, password) => {
        // FastAPI utilise généralement 'username' pour l'authentification OAuth
        const response = await api.post('/token', new URLSearchParams({
            username: email,
            password: password
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    },

    // Inscription utilisateur
    signup: async (userData) => {
        const response = await api.post('/users/', userData);
        return response.data;
    },

    // Récupération des informations de l'utilisateur connecté
    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },
};

// 5. Services pour les jobs
export const jobService = {
    // Récupérer tous les jobs
    getAllJobs: async (params = {}) => {
        try {
            const response = await api.get('/jobs/', { params });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des jobs:", error);
            // Retourner des données factices en cas d'erreur pour le développement
            return {
                jobs: [],
                total: 0
            };
        }
    },

    // Récupérer un job spécifique
    getJob: async (id) => {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
    },

    // Créer un nouveau job
    createJob: async (jobData) => {
        const response = await api.post('/jobs/', jobData);
        return response.data;
    },

    // Mettre à jour un job
    updateJob: async (id, jobData) => {
        const response = await api.put(`/jobs/${id}`, jobData);
        return response.data;
    },

    // Supprimer un job
    deleteJob: async (id) => {
        const response = await api.delete(`/jobs/${id}`);
        return response.data;
    },

    // Récupérer toutes les catégories
    getCategories: async () => {
        try {
            const response = await api.get('/categories/');
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des catégories:", error);
            // Retourner des catégories factices en cas d'erreur
            return [
                { id: 1, name: "Développement" },
                { id: 2, name: "Design" },
                { id: 3, name: "Marketing" }
            ];
        }
    },
};

// 6. Services pour le profil utilisateur
export const userService = {
    // Récupérer le profil
    getProfile: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    // Mettre à jour le profil
    updateProfile: async (userData) => {
        const response = await api.put('/users/me', userData);
        return response.data;
    },
};

// Exporter l'instance api par défaut pour d'autres utilisations si nécessaire
export default api;