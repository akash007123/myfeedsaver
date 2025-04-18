import React, { useState, ChangeEvent, FormEvent } from 'react';
import { usePosts } from '../contexts/PostContext';
import { toast } from 'react-toastify';

const CreatePost: React.FC = () => {
    const { createPost } = usePosts();
    const [description, setDescription] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!mediaFile) {
            toast.error('Please select a media file');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('description', description);
        formData.append('media', mediaFile);
        formData.append('isPublic', String(isPublic));

        try {
            const success = await createPost(formData);
            if (success) {
                toast.success('Post created successfully!');
                // Reset form
                setDescription('');
                setMediaFile(null);
                setPreview(null);
                setIsPublic(false);
            } else {
                toast.error('Failed to create post');
            }
        } catch (error) {
            toast.error('Error creating post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Media (Image/Video)
                    </label>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleMediaChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {preview && (
                        <div className="mt-2">
                            {mediaFile?.type.startsWith('image/') ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-h-48 rounded-lg"
                                />
                            ) : (
                                <video
                                    src={preview}
                                    controls
                                    className="max-h-48 rounded-lg"
                                />
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Write something about your post..."
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                        Make this post public
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                >
                    {loading ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    );
};

export default CreatePost; 