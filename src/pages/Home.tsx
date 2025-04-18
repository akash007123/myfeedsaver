import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../components/AuthContext';
import { PostProvider } from '../contexts/PostContext';
import CreatePost from '../components/CreatePost';
import PostFeed from '../components/PostFeed';
import UserSearch from '../components/UserSearch';
import FriendRequestsList from '../components/FriendRequestsList';
import FriendsList from '../components/FriendsList';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Helper function to get profile picture URL
const getProfilePictureUrl = (filename: string | null | undefined): string | null => {
    if (!filename) {
        console.log("[getProfilePictureUrl] No filename provided.");
        return null;
    }
    // This URL must match the backend configuration in server.js
    const url = `https://myfeedsave-backend.onrender.com/uploads/${filename}`;
    console.log("[getProfilePictureUrl] Generated URL:", url);
    return url;
};

// Define tab types
type DashboardTab = 'posts' | 'search' | 'friends' | 'requests';

const Home: React.FC = () => {
    const { user, logout, updateProfile, deleteAccount, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<DashboardTab>('posts');
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // --- State for Profile Editing ---
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        name: '',
        mobile: '',
        profilePictureFile: null as File | null,
    });
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    // --- End State for Profile Editing ---

    // Effect to initialize profile form data when user loads
    useEffect(() => {
        if (user) {
            console.log("[Home useEffect] User data:", { profilePictureFilename: user.profilePicture });

            setProfileFormData({
                name: user.name || '',
                mobile: user.mobile || '',
                profilePictureFile: null, // Reset file input on user change
            });
            const initialPreviewUrl = getProfilePictureUrl(user.profilePicture);
            setProfilePicturePreview(initialPreviewUrl);
            console.log("[Home useEffect] Initial profile picture preview URL set to:", initialPreviewUrl);
        }
    }, [user]); // Rerun when user object changes

    // --- Profile Edit Handlers ---
    const handleProfileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setProfileFormData((prev) => ({ ...prev, profilePictureFile: file }));

        // Create a preview URL for the selected file
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicturePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            // Revert to original picture if file is deselected
            setProfilePicturePreview(getProfilePictureUrl(user?.profilePicture));
        }
    };

    const handleProfileUpdateSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsUpdatingProfile(true);

        const data = new FormData();
        data.append('name', profileFormData.name);
        data.append('mobile', profileFormData.mobile);
        if (profileFormData.profilePictureFile) {
            data.append('profilePicture', profileFormData.profilePictureFile);
        }

        // Use updateProfile from AuthContext
        const success = await updateProfile(data);

        if (success) {
            toast.success('Profile updated successfully!');
            setIsEditingProfile(false); // Exit edit mode
        } else {
            toast.error('Profile update failed.');
        }
        setIsUpdatingProfile(false);
    };

    const handleCancelProfileEdit = () => {
        setIsEditingProfile(false);
        // Reset form data and preview to current user state
        if (user) {
            setProfileFormData({
                name: user.name || '',
                mobile: user.mobile || '',
                profilePictureFile: null,
            });
            setProfilePicturePreview(getProfilePictureUrl(user.profilePicture));
        }
    };

    const handleDeleteAccountClick = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            setIsDeletingAccount(true);
            const success = await deleteAccount(); // Use deleteAccount from AuthContext
            if (success) {
                toast.success('Account deleted successfully.');
                // Navigation should happen automatically via AuthContext logout logic
            } else {
                toast.error('Failed to delete account.');
                setIsDeletingAccount(false);
            }
        }
    };
    // --- End Profile Edit Handlers ---

    // Handle logout button click
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper function to render the active tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'posts':
                return (
                    <PostProvider>
                        <CreatePost />
                        <PostFeed />
                    </PostProvider>
                );
            case 'search':
                return <UserSearch />;
            case 'friends':
                return <FriendsList />;
            case 'requests':
                return <FriendRequestsList />;
            default:
                return null;
        }
    };

    if (isAuthLoading || !user) {
        // Show loading state while auth context is initializing
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    // Determine profile picture URL to display (preview if editing, otherwise from user data)
    const displayProfilePicUrl = profilePicturePreview || getProfilePictureUrl(user.profilePicture);
    console.log("[Home Render] displayProfilePicUrl:", displayProfilePicUrl);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* --- Navigation Bar --- */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-semibold">Dashboard</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Display Small Profile Pic in Nav */}
                            {displayProfilePicUrl ? (
                                <img
                                    src={displayProfilePicUrl}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                        console.error(`[Image Error] Failed to load image: ${displayProfilePicUrl}`, e);
                                        (e.target as HTMLImageElement).style.border = '2px solid red';
                                    }}
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                            )}
                            <span className="hidden sm:block">{user.name}</span>
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <img
                                        src={user.profilePicture ? `https://myfeedsave-backend.onrender.com/uploads/${user.profilePicture}` : '/default-avatar.png'}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <span className="hidden sm:block">{user.name}</span>
                                </button>
                                
                                {/* Profile Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- Tab Navigation --- */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`px-3 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'posts'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Posts
                        </button>
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`px-3 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'search'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Find Friends
                        </button>
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`px-3 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'friends'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Friends
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-3 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'requests'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Friend Requests
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Content Container */}
                    <div className="bg-white rounded-lg shadow p-6">
                        {renderTabContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
