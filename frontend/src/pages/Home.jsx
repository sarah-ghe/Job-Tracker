import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex items-center justify-center  min-h-screen py-12">
        <div className="max-w-3xl text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">JobTracker</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8">
            Track your job applications easily and stay organized during your job search.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition">
                Get Started
            </Link>
            <Link to="/login" className="border border-blue-600 text-blue-600 py-2 px-6 rounded hover:bg-blue-50 transition">
                Already have an account?
            </Link>
            </div>
        </div>
        </div>
    );
};

export default Home;