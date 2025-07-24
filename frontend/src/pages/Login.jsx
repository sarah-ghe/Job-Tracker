import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation de base
    if (!formData.email || !formData.password) {
      setError("Tous les champs sont requis");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Appel à la fonction login du contexte d'authentification
      // qui utilise maintenant notre service API
      await login(formData.email, formData.password);
      
      // Redirection vers le tableau de bord après connexion réussie
      navigate("/dashboard");
    } catch (err) {
      // Gestion des différents types d'erreurs
      if (err.response) {
        // Le serveur a répondu avec un code d'erreur
        if (err.response.status === 401) {
          setError("Email ou mot de passe incorrect");
        } else if (err.response.data && err.response.data.detail) {
          setError(err.response.data.detail);  
        } else {
          setError("Une erreur s'est produite lors de la connexion");
        }
      } else if (err.request) {
        // La requête a été faite mais pas de réponse
        setError("Impossible de contacter le serveur. Vérifiez votre connexion internet.");
      } else {
        // Erreur lors de la configuration de la requête
        setError("Une erreur s'est produite. Veuillez réessayer.");
      }
      console.error("Erreur de connexion:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] py-12">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Connexion
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Entrez votre email"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Entrez votre mot de passe"
            />
            <div className="mt-1 text-right">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Fonctionnalité à implémenter");
                }}
              >
                Mot de passe oublié?
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={isLoading}
            >
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Vous n&apos;avez pas de compte?{" "}
            <Link to="/signup" className="text-blue-600 hover:text-blue-800">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;