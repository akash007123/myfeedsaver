import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';

interface Post {
    _id: string;
    description: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
}

interface PostContextType {
    posts: Post[];
    loading: boolean;
    error: string | null;
    createPost: (formData: FormData) => Promise<boolean>;
    updatePost: (postId: string, formData: FormData) => Promise<boolean>;
    deletePost: (postId: string) => Promise<boolean>;
    fetchUserPosts: () => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    // Configure axios
    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const fetchUserPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/posts');
            setPosts(response.data.posts);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error fetching posts');
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const createPost = async (formData: FormData): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/posts', formData);
            setPosts(prev => [response.data.post, ...prev]);
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error creating post');
            console.error('Error creating post:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updatePost = async (postId: string, formData: FormData): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.put(`/posts/${postId}`, formData);
            setPosts(prev => prev.map(post => 
                post._id === postId ? response.data.post : post
            ));
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error updating post');
            console.error('Error updating post:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (postId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            await api.delete(`/posts/${postId}`);
            setPosts(prev => prev.filter(post => post._id !== postId));
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error deleting post');
            console.error('Error deleting post:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <PostContext.Provider value={{
            posts,
            loading,
            error,
            createPost,
            updatePost,
            deletePost,
            fetchUserPosts
        }}>
            {children}
        </PostContext.Provider>
    );
};

export const usePosts = () => {
    const context = useContext(PostContext);
    if (context === undefined) {
        throw new Error('usePosts must be used within a PostProvider');
    }
    return context;
}; 