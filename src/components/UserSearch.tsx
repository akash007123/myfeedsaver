import React, { useState } from 'react';
import { useAuth } from './AuthContext'; // Adjust path if needed
import { toast } from 'react-toastify';

interface SearchUser {
    _id: string;
    name: string;
    email: string;
    profilePicture: string | null;
}

// Helper function (can be moved to a utils file)
const getProfilePictureUrl = (filename: string | null | undefined): string | null => {
    if (!filename) return null;
    return `http://localhost:5000/uploads/${filename}`; // Adjust if path differs
};


const UserSearch: React.FC = () => {
    const { searchUsers, sendFriendRequest } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set()); // Track sent requests

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        const users = await searchUsers(query);
        setResults(users);
        setLoading(false);
    };

    const handleSendRequest = async (receiverId: string) => {
        const success = await sendFriendRequest(receiverId);
        if (success) {
            // Add to requested list to disable button
            setRequestedIds(prev => new Set(prev).add(receiverId));
            toast.info("Request sent!");
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3">Find Friends</h3>
            <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="flex-grow px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    }`}
                >
                    {loading ? '...' : 'Search'}
                </button>
            </form>
            {results.length > 0 && (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {results.map(user => (
                        <li key={user._id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                             <div className="flex items-center space-x-2">
                                <img
                                    src={getProfilePictureUrl(user.profilePicture) || '/default-avatar.png'} // Provide a default avatar
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                    <span className="text-sm font-medium">{user.name}</span>
                                    <span className="block text-xs text-gray-500">{user.email}</span>
                                </div>
                             </div>
                            <button
                                onClick={() => handleSendRequest(user._id)}
                                disabled={requestedIds.has(user._id)}
                                className={`px-2 py-1 text-xs rounded ${
                                    requestedIds.has(user._id)
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                            >
                                {requestedIds.has(user._id) ? 'Sent' : 'Add'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {results.length === 0 && !loading && query.trim() && (
                 <p className="text-sm text-gray-500 text-center">No users found.</p>
            )}
        </div>
    );
};

export default UserSearch;

