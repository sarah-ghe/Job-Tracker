import React, { useState, useEffect } from "react";
import { jobService } from "../services/api";
import JobCard from "../components/JobCard";

const Dashboard = () => {
    // États pour les jobs et la pagination
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalJobs, setTotalJobs] = useState(0);
    
    // États pour le formulaire d'ajout
    const [showAddForm, setShowAddForm] = useState(false);
    const [newJob, setNewJob] = useState({
        title: "",
        company: "",
        category_id: 1 // Valeur par défaut
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    
    // États pour le filtrage et la recherche
    const [searchTerm, setSearchTerm] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [sortBy, setSortBy] = useState("date_desc");

    // Récupérer les jobs
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                // Construire les paramètres de requête
                const params = {
                    page,
                    search: searchTerm || undefined,
                    category_id: selectedCategory || undefined,
                    sort_by: sortBy.split('_')[0] || undefined,
                    sort_order: sortBy.split('_')[1] || undefined
                };
                
                // Récupérer les jobs depuis l'API
                const response = await jobService.getAllJobs(params);
                
                if (page === 1) {
                    setJobs(response.jobs);
                } else {
                    setJobs(prevJobs => [...prevJobs, ...response.jobs]);
                }
                
                // Mettre à jour les informations de pagination
                setTotalJobs(response.total);
                setHasMore(response.total > page * 10); // Supposons que la limite est 10
            } catch (err) {
                console.error("Erreur lors de la récupération des jobs:", err);
                setError("Impossible de charger les offres d'emploi");
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [page, searchTerm, selectedCategory, sortBy]);

    // Récupérer les catégories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await jobService.getCategories();
                setCategories(response);
            } catch (err) {
                console.error("Erreur lors de la récupération des catégories:", err);
            }
        };

        fetchCategories();
    }, []);

    // Gérer le chargement de plus de jobs
    const loadMore = () => {
        if (!isLoading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    // Gérer les changements dans le formulaire d'ajout
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewJob(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Soumettre le formulaire d'ajout
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation basique
        if (!newJob.title || !newJob.company) {
            setSubmitError("Veuillez remplir tous les champs obligatoires");
            return;
        }
        
        try {
            setIsSubmitting(true);
            setSubmitError("");
            
            // Convertir category_id en nombre
            const jobData = {
                ...newJob,
                category_id: parseInt(newJob.category_id)
            };
            
            // Envoyer les données à l'API
            await jobService.createJob(jobData);
            
            // Réinitialiser le formulaire et rafraîchir la liste
            setNewJob({
                title: "",
                company: "",
                category_id: 1
            });
            setShowAddForm(false);
            
            // Recharger la première page pour voir le nouveau job
            setPage(1);
        } catch (err) {
            console.error("Erreur lors de l'ajout du job:", err);
            setSubmitError(err.response?.data?.detail || "Impossible d'ajouter l'offre d'emploi");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Gérer la recherche
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Revenir à la première page lors d'une nouvelle recherche
    };

    // Gérer la suppression d'un job
    const handleDeleteJob = async (jobId) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre d'emploi ?")) {
            try {
                await jobService.deleteJob(jobId);
                // Mettre à jour la liste des jobs
                setJobs(jobs.filter(job => job.id !== jobId));
                setTotalJobs(prev => prev - 1);
            } catch (err) {
                console.error("Erreur lors de la suppression du job:", err);
                alert("Impossible de supprimer l'offre d'emploi");
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Tableau de bord</h1>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    {showAddForm ? "Annuler" : "Ajouter une offre"}
                </button>
            </div>
            
            {/* Statistiques simples */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Total des offres</p>
                        <p className="text-2xl font-bold">{totalJobs}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Offres actives</p>
                        <p className="text-2xl font-bold">{jobs.filter(job => job.status !== "closed").length}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600">Ajoutées ce mois</p>
                        <p className="text-2xl font-bold">
                            {jobs.filter(job => {
                                const jobDate = new Date(job.created_at);
                                const now = new Date();
                                return jobDate.getMonth() === now.getMonth() && 
                                       jobDate.getFullYear() === now.getFullYear();
                            }).length}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Formulaire d'ajout */}
            {showAddForm && (
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Ajouter une nouvelle offre d'emploi</h2>
                    
                    {submitError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {submitError}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                                    Titre du poste *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={newJob.title}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="Ex: Développeur Frontend React"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company">
                                    Entreprise *
                                </label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={newJob.company}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="Ex: Acme Inc."
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category_id">
                                Catégorie
                            </label>
                            <select
                                id="category_id"
                                name="category_id"
                                value={newJob.category_id}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                {isSubmitting ? "En cours..." : "Ajouter"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map(job => (
                    <JobCard key={job.id} job={job} onDelete={handleDeleteJob} />
                ))}
            </div>
            
            {isLoading && (
                <div className="text-center my-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Chargement...</p>
                </div>
            )}
            
            {!isLoading && hasMore && (
                <div className="text-center mt-8">
                    <button
                        onClick={loadMore}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Charger plus
                    </button>
                </div>
            )}
            
            {!isLoading && jobs.length === 0 && !error && (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-600">Aucune offre d'emploi trouvée</p>
                    <p className="mt-2 text-gray-500">Commencez à ajouter des offres d'emploi pour les voir ici</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;