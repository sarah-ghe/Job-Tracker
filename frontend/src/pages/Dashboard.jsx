import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Here you would make an API call to fetch the user's jobs
                // For now, we'll use mock data
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const mockJobs = [
                    {
                        id: 1,
                        company: "Tech Corp",
                        position: "Frontend Developer",
                        status: "Applied",
                        date_applied: "2023-05-15",
                        location: "Remote",
                    },
                    {
                        id: 2,
                        company: "Digital Solutions",
                        position: "Full Stack Engineer",
                        status: "Interview",
                        date_applied: "2023-05-10",
                        location: "New York, NY",
                    },
                    {
                        id: 3,
                        company: "Innovative Startup",
                        position: "React Developer",
                        status: "Rejected",
                        date_applied: "2023-05-05",
                        location: "San Francisco, CA",
                    },
                ];

                setJobs(mockJobs);
            } catch (err) {
                setError("Failed to fetch job applications");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "applied":
                return "bg-blue-100 text-blue-800";
            case "interview":
                return "bg-yellow-100 text-yellow-800";
            case "offer":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Job Applications</h1>
                <Link
                    to="/add-job"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Add New Job
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {jobs.length === 0 ? (
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                    <p className="text-gray-600 mb-4">
                        You haven't added any job applications yet.
                    </p>
                    <Link
                        to="/add-job"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Add Your First Job
                    </Link>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Position
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date Applied
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {jobs.map((job) => (
                                <tr key={job.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {job.company}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{job.position}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                job.status
                                            )}`}
                                        >
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {job.date_applied}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {job.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            to={`/jobs/${job.id}`}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
