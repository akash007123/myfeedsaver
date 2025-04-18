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
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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

    const handleImageClick = (imageUrl: string) => {
        setLightboxImage(imageUrl);
    };

    const closeLightbox = () => {
        setLightboxImage(null);
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading posts...</div>;
    if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;

    return (
        <div className="space-y-6">
            {/* Lightbox Modal */}
            {lightboxImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={closeLightbox}
                >
                    <div className="relative max-w-4xl w-full" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <img 
                            src={lightboxImage} 
                            alt="Enlarged view" 
                            className="max-h-[90vh] w-auto mx-auto"
                        />
                        <button 
                            onClick={closeLightbox}
                            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {posts.map(post => (
                <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {editingPost === post._id ? (
                        // Edit Form
                        <div className="p-4 space-y-4">
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
                            <div className="relative">
                                {post.mediaType === 'image' ? (
                                    <img
                                        src={`https://myfeedsave-backend.onrender.com/uploads/posts/${post.mediaUrl}`}
                                        alt="Post"
                                        className="w-full h-auto max-h-[600px] object-contain cursor-pointer"
                                        onClick={() => handleImageClick(`https://myfeedsave-backend.onrender.com/uploads/posts/${post.mediaUrl}`)}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                            (e.target as HTMLImageElement).classList.add('opacity-50');
                                        }}
                                    />
                                ) : (
                                    <video
                                        src={`https://myfeedsave-backend.onrender.com/uploads/posts/${post.mediaUrl}`}
                                        controls
                                        className="w-full h-auto max-h-[600px]"
                                        onError={(e) => {
                                            (e.target as HTMLVideoElement).poster = '/placeholder-video.png';
                                            (e.target as HTMLVideoElement).classList.add('opacity-50');
                                        }}
                                    />
                                )}
                            </div>
                            <div className="p-4">
                                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.description}</p>
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
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PostFeed; 