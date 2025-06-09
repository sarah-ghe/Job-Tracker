import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/api";

// Création du contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté au chargement de l'application
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const storedToken = localStorage.getItem("token");
      
      if (storedToken) {
        try {
          // Récupérer les informations de l'utilisateur à partir du token
          const userData = await authService.getCurrentUser();
          setCurrentUser(userData);
        } catch (err) {
          console.error("Erreur lors de la récupération des données utilisateur:", err);
          // Si le token est invalide ou expiré, déconnecter l'utilisateur
          logout();
        }
      }
      
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      // Appel à l'API pour se connecter
      const response = await authService.login(email, password);
      
      // Stocker le token dans le localStorage
      localStorage.setItem("token", response.access_token);
      setToken(response.access_token);
      
      // Récupérer les informations de l'utilisateur
      const userData = await authService.getCurrentUser();
      setCurrentUser(userData);
      
      return userData;
    } catch (error) {
      setError(error.message || "Erreur lors de la connexion");
      throw error;
    }
  };

  // Fonction d'inscription
  const signup = async (userData) => {
    try {
      // Appel à l'API pour créer un compte
      const response = await authService.signup(userData);
      return response;
    } catch (error) {
      setError(error.message || "Erreur lors de l'inscription");
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    // Supprimer le token du localStorage
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
  };

  // Valeur du contexte à fournir aux composants enfants
  const value = {
    currentUser,
    token,
    loading,
    error,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};