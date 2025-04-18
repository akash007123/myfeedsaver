import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

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

const Messaging: React.FC = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const apiClient = axios.create({
        baseURL: 'https://myfeedsave-backend.onrender.com/api',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const fetchConversations = async () => {
        try {
            const response = await apiClient.get('/messages/conversations');
            setConversations(response.data.conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            toast.error('Failed to load conversations');
        }
    };

    const fetchMessages = async (userId: string) => {
        try {
            const response = await apiClient.get(`/messages/conversation/${userId}`);
            setMessages(response.data.messages);
            setSelectedConversation(userId);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const response = await apiClient.post('/messages/send', {
                receiverId: selectedConversation,
                content: newMessage
            });

            setMessages(prev => [...prev, response.data.data]);
            setNewMessage('');
            fetchConversations(); // Refresh conversations to update last message
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
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
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Messages</h2>
                </div>
                <div className="overflow-y-auto h-[calc(100%-4rem)]">
                    {conversations.map(conversation => (
                        <div
                            key={conversation.user._id}
                            className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                                selectedConversation === conversation.user._id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => fetchMessages(conversation.user._id)}
                        >
                            <div className="flex items-center space-x-3">
                                <img
                                    src={conversation.user.profilePicture 
                                        ? `https://myfeedsave-backend.onrender.com/uploads/${conversation.user.profilePicture}`
                                        : '/default-avatar.png'}
                                    alt={conversation.user.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium">{conversation.user.name}</h3>
                                        {conversation.unreadCount > 0 && (
                                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                                                {conversation.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">
                                        {conversation.lastMessage.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-4">
                            {messages.map(message => (
                                <div
                                    key={message._id}
                                    className={`mb-4 ${
                                        message.sender._id === user?._id
                                            ? 'text-right'
                                            : 'text-left'
                                    }`}
                                >
                                    <div
                                        className={`inline-block p-3 rounded-lg ${
                                            message.sender._id === user?._id
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-800'
                                        }`}
                                    >
                                        {message.content}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(message.createdAt).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messaging; 