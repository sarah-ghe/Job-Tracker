import React from "react";
import { Link } from "react-router-dom";

export default function JobCard({ job }) {
  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour déterminer la couleur du statut
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'offer':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 hover:shadow-lg transition">
      <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
      <p className="text-sm text-gray-600">{job.company} — {job.location}</p>
      <p className="text-xs text-gray-400 mt-2">Posted on: {formatDate(job.date)}</p>
    </div>
  );
}
