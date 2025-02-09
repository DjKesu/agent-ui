import React, { useState, useEffect } from 'react';
import { ChromaDBService } from '../../services/chromadb.service';
import { ChromaDBStatus } from '../../types/chromadb';
import { CollectionManager } from './CollectionManager';

export const ChromaDBManager: React.FC = () => {
    const [status, setStatus] = useState<ChromaDBStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkStatus = async () => {
        try {
            const response = await ChromaDBService.getStatus();
            setStatus(response);
            setError(null);
        } catch (err: any) {
            setStatus({ status: 'disconnected', error: err.message });
            setError(err.message);
        }
    };

    useEffect(() => {
        checkStatus();
        // Poll status every 30 seconds
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleCleanup = async () => {
        // Show confirmation dialog
        const confirmed = window.confirm(
            'Warning: This will delete all ChromaDB collections and data. This action cannot be undone. Are you sure you want to proceed?'
        );

        if (!confirmed) return;

        setIsLoading(true);
        try {
            await ChromaDBService.cleanup();
            await checkStatus();
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Status Section */}
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">ChromaDB Status</h2>
                
                <div className="mb-6">
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                            status?.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="font-medium">{status?.status || 'Checking...'}</span>
                    </div>
                    {status?.dataPath && (
                        <p className="text-sm text-gray-600 mt-1">
                            Data Path: {status.dataPath}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <button
                        onClick={handleCleanup}
                        disabled={isLoading || status?.status !== 'connected'}
                        className={`px-4 py-2 rounded-md text-white ${
                            isLoading || status?.status !== 'connected'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600'
                        }`}
                    >
                        {isLoading ? 'Cleaning up...' : 'Clean Up ChromaDB'}
                    </button>

                    {error && (
                        <div className="text-red-500 text-sm mt-2">
                            Error: {error}
                        </div>
                    )}
                </div>

                {/* Help Text */}
                <div className="mt-6 text-sm text-gray-600">
                    <h4 className="font-semibold mb-2">About ChromaDB Management</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>ChromaDB is used as the vector database for storing and querying embeddings.</li>
                        <li>The cleanup action will remove all collections and their associated data.</li>
                        <li>After cleanup, you'll need to recreate any collections you want to use.</li>
                        <li>Regular backups of important data are recommended.</li>
                    </ul>
                </div>
            </div>

            {/* Collections Section */}
            {status?.status === 'connected' && <CollectionManager />}
        </div>
    );
}; 