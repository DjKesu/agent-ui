import React, { useState, useEffect } from 'react';
import { ChromaDBService } from '../../services/chromadb.service';
import { Collection, OperationResponse } from '../../types/chromadb';

export const CollectionManager: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadCollections = async () => {
        try {
            const response = await ChromaDBService.listCollections();
            if (response.success) {
                setCollections(response.data);
                setError(null);
            } else {
                setError(response.error || 'Failed to load collections');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        loadCollections();
    }, []);

    const handleCreateCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;

        setIsLoading(true);
        try {
            const response = await ChromaDBService.createCollection(newCollectionName);
            if (response.success) {
                setNewCollectionName('');
                await loadCollections();
                setError(null);
            } else {
                setError(response.error || 'Failed to create collection');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCollection = async (name: string) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete collection "${name}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        setIsLoading(true);
        try {
            const response = await ChromaDBService.deleteCollection(name);
            if (response.success) {
                await loadCollections();
                setError(null);
            } else {
                setError(response.error || 'Failed to delete collection');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Collections</h2>

            {/* Create Collection Form */}
            <form onSubmit={handleCreateCollection} className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="Collection name"
                        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !newCollectionName.trim()}
                        className={`px-4 py-2 rounded-md text-white ${
                            isLoading || !newCollectionName.trim()
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                        {isLoading ? 'Creating...' : 'Create Collection'}
                    </button>
                </div>
            </form>

            {/* Collections List */}
            <div className="space-y-4">
                {collections.map((collection) => (
                    <div
                        key={collection.name}
                        className="flex items-center justify-between p-4 border rounded-md"
                    >
                        <div>
                            <h3 className="font-semibold">{collection.name}</h3>
                            {collection.metadata && (
                                <p className="text-sm text-gray-600">
                                    Metadata: {JSON.stringify(collection.metadata)}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => handleDeleteCollection(collection.name)}
                            disabled={isLoading}
                            className="px-3 py-1 text-sm text-red-500 hover:text-red-600 disabled:text-gray-400"
                        >
                            Delete
                        </button>
                    </div>
                ))}

                {collections.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                        No collections found. Create one to get started.
                    </p>
                )}
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}
        </div>
    );
}; 