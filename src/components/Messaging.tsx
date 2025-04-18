import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Manager } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

interface Message {
    _id: string;
    sender: {
        _id: string;
        name: string;
        profilePicture: string | null;
    };
    receiver: {
        _id: string;
        name: string;
        profilePicture: string | null;
    };
    content: string;
    read: boolean;
    createdAt: string;
}

interface Conversation {
    user: {
        _id: string;
        name: string;
        profilePicture: string | null;
    };
    lastMessage: Message;
    unreadCount: number;
}

interface MessagingProps {
    initialConversation?: string | null;
}

const Messaging: React.FC<MessagingProps> = ({ initialConversation = null }) => {
    const { user, token } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(initialConversation);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showConversations, setShowConversations] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<typeof Socket | null>(null);

    const apiClient = axios.create({
        baseURL: 'https://myfeedsave-backend.onrender.com/api',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    // Initialize WebSocket connection
    useEffect(() => {
        if (user && token) {
            console.log('Initializing WebSocket connection...');
            
            // Connect to WebSocket server with proper configuration
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

            // Connection event handlers
            socketRef.current.on('connect', () => {
                console.log('WebSocket connected successfully');
            });

            socketRef.current.on('connect_error', (error: any) => {
                console.error('WebSocket connection error:', error);
            });

            // Listen for new messages
            socketRef.current.on('newMessage', (message: Message) => {
                console.log('Received new message:', message);
                setMessages(prev => {
                    // Check if message already exists to prevent duplicates
                    if (!prev.some(msg => msg._id === message._id)) {
                        return [...prev, message];
                    }
                    return prev;
                });
                
                // Update conversations list
                fetchConversations();
            });

            // Listen for message read status
            socketRef.current.on('messageRead', (data: { messageId: string, read: boolean }) => {
                console.log('Message read status updated:', data);
                setMessages(prev => prev.map(msg => 
                    msg._id === data.messageId ? { ...msg, read: data.read } : msg
                ));
            });

            // Cleanup on unmount
            return () => {
                console.log('Cleaning up WebSocket connection');
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [user, token]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/messages/conversations');
            if (response.data && Array.isArray(response.data.conversations)) {
                setConversations(response.data.conversations);
                
                if (initialConversation && messages.length === 0) {
                    fetchMessages(initialConversation);
                }
            } else {
                console.error('Invalid response format:', response.data);
                toast.error('Invalid response from server');
                setConversations([]);
            }
        } catch (error: any) {
            console.error('Error fetching conversations:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            toast.error(error.response?.data?.message || 'Failed to load conversations');
            setConversations([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId: string) => {
        try {
            const response = await apiClient.get(`/messages/conversation/${userId}`);
            setMessages(response.data.messages);
            setSelectedConversation(userId);
            setShowConversations(false);

            // Mark messages as read
            if (socketRef.current) {
                socketRef.current.emit('markMessagesAsRead', { userId });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            // Create a temporary message object to show immediately
            const tempMessage = {
                _id: `temp-${Date.now()}`,
                sender: {
                    _id: user?._id || '',
                    name: user?.name || '',
                    profilePicture: user?.profilePicture || null
                },
                receiver: {
                    _id: selectedConversation,
                    name: conversations.find(c => c.user._id === selectedConversation)?.user.name || '',
                    profilePicture: conversations.find(c => c.user._id === selectedConversation)?.user.profilePicture || null
                },
                content: newMessage,
                read: false,
                createdAt: new Date().toISOString()
            };

            // Add the temporary message to the messages array
            setMessages(prev => [...prev, tempMessage]);
            setNewMessage('');

            // Send the message to the server
            const response = await apiClient.post('/messages/send', {
                receiverId: selectedConversation,
                content: newMessage
            });

            // Replace the temporary message with the actual message from the server
            setMessages(prev => prev.map(msg => 
                msg._id === tempMessage._id ? response.data.data : msg
            ));

            // Emit the message through WebSocket
            if (socketRef.current) {
                console.log('Emitting message through WebSocket:', {
                    message: response.data.data,
                    receiverId: selectedConversation
                });
                socketRef.current.emit('sendMessage', {
                    message: response.data.data,
                    receiverId: selectedConversation
                });
            }

            // Update the conversations list
            fetchConversations();
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
            // Remove the temporary message if sending fails
            setMessages(prev => prev.filter(msg => msg._id !== `temp-${Date.now()}`));
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-gray-50">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white shadow-sm sticky top-0 z-10">
                <button
                    onClick={() => setShowConversations(!showConversations)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Toggle conversations"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Messages</h2>
                <div className="w-5 sm:w-6"></div> {/* Spacer for alignment */}
            </div>

            {/* Conversations List */}
            <div className={`${showConversations ? 'block' : 'hidden'} md:block w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white shadow-sm`}>
                <div className="hidden md:block p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-[calc(100%-4rem)]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)] text-gray-500 p-4 text-center">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-base sm:text-lg font-medium text-gray-700">No conversations yet</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">Start a conversation with your friends</p>
                    </div>
                ) : (
                    <div className="overflow-y-auto h-[calc(100%-4rem)]">
                        {conversations.map(conversation => (
                            <div
                                key={conversation.user._id}
                                className={`p-3 sm:p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                                    selectedConversation === conversation.user._id ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => fetchMessages(conversation.user._id)}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <img
                                            src={conversation.user.profilePicture 
                                                ? `https://myfeedsave-backend.onrender.com/uploads/${conversation.user.profilePicture}`
                                                : '/default-avatar.png'}
                                            alt={conversation.user.name}
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/default-avatar.png';
                                            }}
                                        />
                                        {conversation.unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-sm">
                                                {conversation.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">{conversation.user.name}</h3>
                                            <span className="text-xs text-gray-500">
                                                {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                                            {conversation.lastMessage.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedConversation ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                            {messages.map(message => (
                                <div
                                    key={message._id}
                                    className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className="max-w-[85%] sm:max-w-[80%]">
                                        <div className="flex items-end space-x-2">
                                            {message.sender._id !== user?._id && (
                                                <img
                                                    src={message.sender.profilePicture 
                                                        ? `https://myfeedsave-backend.onrender.com/uploads/${message.sender.profilePicture}`
                                                        : '/default-avatar.png'}
                                                    alt={message.sender.name}
                                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-gray-200"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                                                    }}
                                                />
                                            )}
                                            <div>
                                                <div
                                                    className={`inline-block p-2 sm:p-3 rounded-lg ${
                                                        message.sender._id === user?._id
                                                            ? 'bg-blue-500 text-white rounded-br-none'
                                                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                                    }`}
                                                >
                                                    <p className="text-sm sm:text-base">{message.content}</p>
                                                </div>
                                                <div className={`text-xs text-gray-500 mt-1 ${message.sender._id === user?._id ? 'text-right' : 'text-left'}`}>
                                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={sendMessage} className="p-3 sm:p-4 border-t border-gray-200 bg-white shadow-sm sticky bottom-0">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm sm:text-base"
                                />
                                <button
                                    type="submit"
                                    className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                    disabled={!newMessage.trim()}
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-4">
                        <svg className="w-16 h-16 sm:w-20 sm:h-20 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-base sm:text-lg font-medium text-gray-700">Select a conversation</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">Choose a friend to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messaging;