export interface User {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    friends: string[];
}

export interface Post {
    _id: string;
    description: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    author: User;
} 