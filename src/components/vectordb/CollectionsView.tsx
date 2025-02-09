import React from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { VectorDBDocument } from '../../types/chromadb';
import {
    collectionsAtom,
    selectedCollectionAtom,
    collectionPreviewsAtom,
    isLoadingAtom,
    errorAtom,
    fetchCollectionsAtom,
    fetchCollectionPreviewAtom
} from '../../store/atoms/chromadb';

export const CollectionsView: React.FC = () => {
    const [collections] = useAtom(collectionsAtom);
    const [selectedCollection, setSelectedCollection] = useAtom(selectedCollectionAtom);
    const [collectionPreviews] = useAtom(collectionPreviewsAtom);
    const [isLoading] = useAtom(isLoadingAtom);
    const [error] = useAtom(errorAtom);
    const fetchCollections = useSetAtom(fetchCollectionsAtom);
    const fetchCollectionPreview = useSetAtom(fetchCollectionPreviewAtom);

    React.useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const handleCollectionClick = async (collectionName: string) => {
        setSelectedCollection(collectionName);
        if (!collectionPreviews[collectionName]) {
            await fetchCollectionPreview(collectionName);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 p-4">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((collection) => (
                    <div
                        key={collection.name}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors
                            ${selectedCollection === collection.name
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                        onClick={() => handleCollectionClick(collection.name)}
                    >
                        <h3 className="text-lg font-semibold mb-2">{collection.name}</h3>
                        {collection.metadata && (
                            <div className="text-sm text-gray-600 mb-2">
                                <strong>Metadata:</strong>{' '}
                                {JSON.stringify(collection.metadata)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedCollection && collectionPreviews[selectedCollection] && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">
                        Preview: {selectedCollection}
                    </h2>
                    <div className="space-y-4">
                        {collectionPreviews[selectedCollection].map((doc: VectorDBDocument) => (
                            <div
                                key={doc.id}
                                className="p-4 bg-white rounded-lg border border-gray-200"
                            >
                                <div className="text-sm text-gray-500 mb-1">
                                    ID: {doc.id}
                                </div>
                                <div className="text-gray-800">
                                    {doc.document.length > 200
                                        ? `${doc.document.substring(0, 200)}...`
                                        : doc.document}
                                </div>
                                {doc.metadata && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <strong>Metadata:</strong>{' '}
                                        {JSON.stringify(doc.metadata)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {collections.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    No collections found. Create a collection to get started.
                </div>
            )}
        </div>
    );
}; 