import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Adjust path

interface FriendUser {
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


const FriendsList: React.FC = () => {
    const { getFriends } = useAuth();
    const [friends, setFriends] = useState<FriendUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFriends = useCallback(async () => {
        setLoading(true);
        const friendList = await getFriends();
        setFriends(friendList);
        setLoading(false);
    }, [getFriends]);

    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

     // TODO: Add unfriend functionality later
    // const handleUnfriend = async (friendId: string) => { ... };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">My Friends</h2>
            {loading ? (
                <div className="text-center py-4">Loading friends...</div>
            ) : friends.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                    You haven't added any friends yet.
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {friends.map(friend => (
                        <div key={friend._id} className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
                            <img
                                src={friend.profilePicture ? `https://myfeedsave-backend.onrender.com/uploads/${friend.profilePicture}` : '/default-avatar.png'}
                                alt={friend.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="font-medium">{friend.name}</h3>
                                <p className="text-sm text-gray-500">{friend.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FriendsList;