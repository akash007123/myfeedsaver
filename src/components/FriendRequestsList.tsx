import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Adjust path
import { toast } from 'react-toastify';

interface FriendRequestUser {
    _id: string;
    name: string;
    email: string;
    profilePicture: string | null;
}

// Helper function (can be moved to a utils file)
const getProfilePictureUrl = (filename: string | null | undefined): string | null => {
    if (!filename) return null;
    return `https://myfeedsave-backend.onrender.com/uploads/${filename}`; // Adjust if path differs
};


const FriendRequestsList: React.FC = () => {
    const { getFriendRequests, acceptFriendRequest, rejectFriendRequest } = useAuth();
    const [requests, setRequests] = useState<FriendRequestUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        const reqs = await getFriendRequests();
        setRequests(reqs);
        setLoading(false);
    }, [getFriendRequests]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAccept = async (senderId: string) => {
        const success = await acceptFriendRequest(senderId);
        if (success) {
            fetchRequests(); // Refresh list after action
        }
    };

    const handleReject = async (senderId: string) => {
        const success = await rejectFriendRequest(senderId);
        if (success) {
            fetchRequests(); // Refresh list after action
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
            {loading ? (
                <div className="text-center py-4">Loading requests...</div>
            ) : requests.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                    No pending friend requests.
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {requests.map(request => (
                        <div key={request._id} className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center space-x-4 mb-4">
                                <img
                                    src={request.profilePicture ? `https://myfeedsave-backend.onrender.com/uploads/${request.profilePicture}` : '/default-avatar.png'}
                                    alt={request.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-medium">{request.name}</h3>
                                    <p className="text-sm text-gray-500">{request.email}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleAccept(request._id)}
                                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleReject(request._id)}
                                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FriendRequestsList;
