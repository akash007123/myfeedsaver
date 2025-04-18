import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import { Manager } from 'socket.io-client';

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
    const { token, logout } = useAuth();
    const socketRef = useRef<any>(null);

    // Initialize WebSocket connection
    useEffect(() => {
        if (token) {
            console.log('Initializing WebSocket connection for posts...');
            
            const manager = new Manager('https://myfeedsave-backend.onrender.com', {
                auth: {
                    token: token
                },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 20000
            });

            socketRef.current = manager.socket('/');

            // Listen for new posts
            socketRef.current.on('newPost', (post: Post) => {
                console.log('Received new post:', post);
                setPosts(prev => {
                    // Check if post already exists to prevent duplicates
                    if (!prev.some(p => p._id === post._id)) {
                        return [post, ...prev];
                    }
                    return prev;
                });
            });

            // Listen for post updates
            socketRef.current.on('postUpdated', (updatedPost: Post) => {
                console.log('Post updated:', updatedPost);
                setPosts(prev => prev.map(post => 
                    post._id === updatedPost._id ? updatedPost : post
                ));
            });

            // Listen for post deletions
            socketRef.current.on('postDeleted', (postId: string) => {
                console.log('Post deleted:', postId);
                setPosts(prev => prev.filter(post => post._id !== postId));
            });

            // Connection event handlers
            socketRef.current.on('connect', () => {
                console.log('WebSocket connected successfully for posts');
            });

            socketRef.current.on('connect_error', (error: any) => {
                console.error('WebSocket connection error:', error);
                if (error.response?.status === 401) {
                    logout();
                }
            });

            // Cleanup on unmount
            return () => {
                console.log('Cleaning up WebSocket connection for posts');
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [token, logout]);

    // Create API client with current token
    const api = React.useMemo(() => {
        if (!token) {
            return null;
        }

        const instance = axios.create({
            baseURL: 'https://myfeedsave-backend.onrender.com/api',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Add response interceptor to handle token errors
        instance.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    setError('Session expired. Please log in again.');
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return instance;
    }, [token, logout]);

    const fetchUserPosts = useCallback(async () => {
        if (!api) {
            setError('Not authenticated');
            return;
        }

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
    }, [api]);

    const createPost = async (formData: FormData): Promise<boolean> => {
        if (!api) {
            setError('Not authenticated');
            return false;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/posts', formData);
            
            // Emit the new post through WebSocket
            if (socketRef.current) {
                socketRef.current.emit('createPost', response.data.post);
            }
            
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
        if (!api) {
            setError('Not authenticated');
            return false;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await api.put(`/posts/${postId}`, formData);
            
            // Emit the updated post through WebSocket
            if (socketRef.current) {
                socketRef.current.emit('updatePost', response.data.post);
            }
            
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
        if (!api) {
            setError('Not authenticated');
            return false;
        }

        try {
            setLoading(true);
            setError(null);
            await api.delete(`/posts/${postId}`);
            
            // Emit the deleted post ID through WebSocket
            if (socketRef.current) {
                socketRef.current.emit('deletePost', postId);
            }
            
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

    // Fetch posts when token changes
    useEffect(() => {
        if (token) {
            fetchUserPosts();
        } else {
            setPosts([]);
            setError('Not authenticated');
        }
    }, [token, fetchUserPosts]);

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