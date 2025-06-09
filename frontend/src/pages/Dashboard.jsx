import React, { useState, useEffect } from "react";
import { jobService } from "../services/api";
import JobCard from "../components/JobCard";

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                // Récupérer les jobs depuis l'API
                const response = await jobService.getAllJobs(page);
                
                if (page === 1) {
                    setJobs(response.items);
                } else {
                    setJobs(prevJobs => [...prevJobs, ...response.items]);
                }
                
                // Vérifier s'il y a plus de jobs à charger
                setHasMore(response.total > page * response.limit);
            } catch (err) {
                console.error("Erreur lors de la récupération des jobs:", err);
                setError("Impossible de charger les offres d'emploi");
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [page]);

    const loadMore = () => {
        if (!isLoading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map(job => (
                    <JobCard key={job.id} job={job} />
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