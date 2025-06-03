import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
    const { currentUser, logout } = useAuth();
    
    const handleLogout = () => {
        logout();
        // No need to navigate - protected routes will handle redirection
    };
    
    return (
        <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-blue-600">
                    JobTracker
                </Link>
                {/* Navigation links */}
                <div className="space-x-6 text-gray-700 font-medium text-lg">
                    <Link to="/" className="hover:text-blue-600 transition">Home</Link>
                    
                    {currentUser ? (
                        <>
                            <Link to="/profile" className="hover:text-blue-600 transition">Profile</Link>
                            <button  onClick={handleLogout} className="bg-white hover:text-blue-600 transition">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-blue-600 transition">Login</Link>
                            <Link to="/signup" className="hover:text-blue-600 transition">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}