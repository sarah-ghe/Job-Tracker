import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userService } from "../services/api";

const Profile = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [profileData, setProfileData] = useState({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        bio: "",
        location: "",
    });
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!currentUser) {
                navigate("/login");
                return;
            }

            try {
                // Récupérer les données du profil depuis l'API
                const userData = await userService.getProfile();
                
                setProfileData({
                    username: userData.username || "",
                    email: userData.email || "",
                    firstName: userData.first_name || "",
                    lastName: userData.last_name || "",
                    bio: userData.bio || "",
                    location: userData.location || "",
                });
            } catch (err) {
                console.error("Erreur lors de la récupération du profil:", err);
                setError("Impossible de charger les données du profil");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [currentUser, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Préparer les données à envoyer à l'API
            const updateData = {
                username: profileData.username,
                first_name: profileData.firstName,
                last_name: profileData.lastName,
                bio: profileData.bio,
                location: profileData.location,
            };

            // Appel à l'API pour mettre à jour le profil
            await userService.updateProfile(updateData);

            setMessage({ text: "Profil mis à jour avec succès !", type: "success" });
            setIsEditing(false);
        } catch (err) {
            console.error("Erreur lors de la mise à jour du profil:", err);
            
            if (err.response && err.response.data && err.response.data.detail) {
                setMessage({ text: err.response.data.detail, type: "error" });
            } else {
                setMessage({ text: "Échec de la mise à jour du profil", type: "error" });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Mock statistics - will be replaced with real data
    const stats = {
        totalApplications: 15,
        interviews: 5,
        offers: 2,
        rejections: 3,
        pending: 5,
    };

    if (isLoading && !isEditing) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-gray-600">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Profile Header */}
                <div className="bg-blue-600 text-white p-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">My Profile</h1>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
                        {error}
                    </div>
                )}

                {/* Success or Error Message */}
                {message.text && (
                    <div 
                        className={`p-4 mb-6 rounded ${
                            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Profile Content */}
                <div className="p-6">
                    {isEditing ? (
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={profileData.username}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        disabled
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={profileData.firstName}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={profileData.lastName}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={profileData.location}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={profileData.bio}
                                        onChange={handleChange}
                                        rows="4"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Personal Information
                                    </h2>
                                    <div className="mt-4 space-y-3">
                                        <p>
                                            <span className="font-medium text-gray-600">
                                                Username:
                                            </span>{" "}
                                            {profileData.username}
                                        </p>
                                        <p>
                                            <span className="font-medium text-gray-600">Email:</span>{" "}
                                            {profileData.email}
                                        </p>
                                        <p>
                                            <span className="font-medium text-gray-600">Name:</span>{" "}
                                            {profileData.firstName} {profileData.lastName}
                                        </p>
                                        <p>
                                            <span className="font-medium text-gray-600">
                                                Location:
                                            </span>{" "}
                                            {profileData.location}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">Bio</h2>
                                    <p className="mt-4 text-gray-700">{profileData.bio}</p>
                                </div>
                            </div>

                            {/* Application Statistics */}
                            <div className="mt-10">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    Application Statistics
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {stats.totalApplications}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Total Applications
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {stats.interviews}
                                        </div>
                                        <div className="text-sm text-gray-600">Interviews</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {stats.offers}
                                        </div>
                                        <div className="text-sm text-gray-600">Offers</div>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {stats.rejections}
                                        </div>
                                        <div className="text-sm text-gray-600">Rejections</div>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {stats.pending}
                                        </div>
                                        <div className="text-sm text-gray-600">Pending</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;