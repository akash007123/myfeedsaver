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
const getProfilePictureUrl = (filename: string | null): string | null => {
    if (!filename) return null;
    return `https://myfeedsave-backend.onrender.com/uploads/${filename}`;
};


const FriendRequestsList: React.FC = () => {
    const { getFriendRequests, acceptFriendRequest, rejectFriendRequest } = useAuth();
    const [requests, setRequests] = useState<FriendRequestUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const reqs = await getFriendRequests();
            setRequests(reqs);
        } catch (error) {
            toast.error('Failed to fetch friend requests');
        } finally {
            setLoading(false);
        }
    }, [getFriendRequests]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAccept = async (senderId: string) => {
        try {
            const success = await acceptFriendRequest(senderId);
            if (success) {
                toast.success('Friend request accepted!');
                fetchRequests();
            }
        } catch (error) {
            toast.error('Failed to accept friend request');
        }
    };

    const handleReject = async (senderId: string) => {
        try {
            const success = await rejectFriendRequest(senderId);
            if (success) {
                toast.success('Friend request rejected');
                fetchRequests();
            }
        } catch (error) {
            toast.error('Failed to reject friend request');
        }
    };

    return (
        <div className="space-y-4 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Friend Requests</h2>
            {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">No pending friend requests</p>
                    <p className="text-sm text-gray-400 mt-2">When someone sends you a friend request, it will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {requests.map(request => (
                        <div 
                            key={request._id} 
                            className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="relative">
                                    <img
                                        src={request.profilePicture ? getProfilePictureUrl(request.profilePicture) || '/default-avatar.png' : '/default-avatar.png'}
                                        alt={request.name}
                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/default-avatar.png';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate">{request.name}</h3>
                                    <p className="text-sm text-gray-500 truncate">{request.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={() => handleAccept(request._id)}
                                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200 text-sm sm:text-base"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleReject(request._id)}
                                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 text-sm sm:text-base"
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
