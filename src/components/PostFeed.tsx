import React, { useState, useEffect } from 'react';
import { usePosts } from '../contexts/PostContext';
import { toast } from 'react-toastify';

interface Post {
    _id: string;
    description: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
}

const PostFeed: React.FC = () => {
    const { posts, loading, error, fetchUserPosts, deletePost, updatePost } = usePosts();
    const [editingPost, setEditingPost] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        description: '',
        isPublic: false
    });
    const [editMedia, setEditMedia] = useState<File | null>(null);

    useEffect(() => {
        fetchUserPosts();
    }, [fetchUserPosts]);

    const handleEdit = (post: Post) => {
        setEditingPost(post._id);
        setEditForm({
            description: post.description,
            isPublic: post.isPublic
        });
        setEditMedia(null);
    };

    const handleUpdate = async (postId: string) => {
        const formData = new FormData();
        formData.append('description', editForm.description);
        formData.append('isPublic', String(editForm.isPublic));
        if (editMedia) {
            formData.append('media', editMedia);
        }

        try {
            const success = await updatePost(postId, formData);
            if (success) {
                toast.success('Post updated successfully!');
                setEditingPost(null);
            } else {
                toast.error('Failed to update post');
            }
        } catch (error) {
            toast.error('Error updating post');
        }
    };

    const handleDelete = async (postId: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                const success = await deletePost(postId);
                if (success) {
                    toast.success('Post deleted successfully!');
                } else {
                    toast.error('Failed to delete post');
                }
            } catch (error) {
                toast.error('Error deleting post');
            }
        }
    };

    if (loading) return <div>Loading posts...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="space-y-6">
            {posts.map(post => (
                <div key={post._id} className="bg-white rounded-lg shadow-md p-4">
                    {editingPost === post._id ? (
                        // Edit Form
                        <div className="space-y-4">
                            <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={3}
                            />
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editForm.isPublic}
                                    onChange={(e) => setEditForm(prev => ({
                                        ...prev,
                                        isPublic: e.target.checked
                                    }))}
                                    className="mr-2"
                                />
                                <label>Make public</label>
                            </div>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={(e) => setEditMedia(e.target.files?.[0] || null)}
                                className="w-full"
                            />
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleUpdate(post._id)}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingPost(null)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Display Post
                        <>
                            {post.mediaType === 'image' ? (
                                <img
                                    src={`https://myfeedsave-backend.onrender.com/uploads/posts/${post.mediaUrl}`}
                                    alt="Post"
                                    className="w-full h-64 object-cover rounded-lg mb-4"
                                />
                            ) : (
                                <video
                                    src={`https://myfeedsave-backend.onrender.com/uploads/posts/${post.mediaUrl}`}
                                    controls
                                    className="w-full h-64 object-cover rounded-lg mb-4"
                                />
                            )}
                            <p className="text-gray-800 mb-4">{post.description}</p>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className="text-blue-500 hover:text-blue-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post._id)}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PostFeed; 