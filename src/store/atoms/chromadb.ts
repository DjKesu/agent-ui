import { atom } from 'jotai';
import { ChromaDBService } from '../../services/chromadb.service';
import { Collection, VectorDBDocument, EmbeddingModelInfo, EmbeddingModelConfig } from '../../types/chromadb';

export interface InstallationProgress {
    step: 'idle' | 'downloading' | 'installing' | 'configuring' | 'completed' | 'failed';
    message: string;
}

// State atoms
export const isInstalledAtom = atom<boolean>(false);
export const isLoadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);
export const installationProgressAtom = atom<{
    step: 'idle' | 'checking' | 'installing' | 'initializing' | 'complete' | 'failed';
    message: string;
}>({
    step: 'idle',
    message: ''
});

export const collectionsAtom = atom<Collection[]>([]);
export const selectedCollectionAtom = atom<string | null>(null);
export const collectionPreviewsAtom = atom<Record<string, VectorDBDocument[]>>({});
export const availableModelsAtom = atom<EmbeddingModelInfo[]>([]);
export const currentModelAtom = atom<EmbeddingModelConfig | null>(null);

// Action atoms
export const installChromaDBAtom = atom(
    null,
    async (get, set) => {
        try {
            set(isLoadingAtom, true);
            set(errorAtom, null);
            set(installationProgressAtom, {
                step: 'installing',
                message: 'Installing ChromaDB...'
            });

            await ChromaDBService.install();
            const status = await ChromaDBService.getStatus();
            
            if (status.status === 'connected') {
                set(isInstalledAtom, true);
                set(installationProgressAtom, {
                    step: 'complete',
                    message: 'Installation complete'
                });
            } else {
                throw new Error('Failed to install ChromaDB');
            }
        } catch (error: any) {
            set(errorAtom, error.message);
            set(installationProgressAtom, {
                step: 'failed',
                message: error.message || 'Installation failed'
            });
            throw error;
        } finally {
            set(isLoadingAtom, false);
        }
    }
);

export const uninstallChromaDBAtom = atom(
    null,
    async (get, set) => {
        try {
            set(isLoadingAtom, true);
            set(errorAtom, null);
            
            await ChromaDBService.uninstall();
            
            // Reset all state
            set(isInstalledAtom, false);
            set(installationProgressAtom, { step: 'idle', message: '' });
            set(collectionsAtom, []);
            set(selectedCollectionAtom, null);
            set(collectionPreviewsAtom, {});
            set(availableModelsAtom, []);
            set(currentModelAtom, null);
            
        } catch (error: any) {
            set(errorAtom, error.message);
            throw error;
        } finally {
            set(isLoadingAtom, false);
        }
    }
);

export const checkChromaDBStatusAtom = atom(
    null,
    async (get, set) => {
        try {
            const response = await ChromaDBService.getStatus();
            set(isInstalledAtom, response.status === 'connected');
            return response.status === 'connected';
        } catch (error: any) {
            set(errorAtom, error.message);
            return false;
        }
    }
);

export const fetchCollectionsAtom = atom(
    null,
    async (get, set) => {
        try {
            set(isLoadingAtom, true);
            set(errorAtom, null);
            
            const response = await ChromaDBService.listCollections();
            if (response.success) {
                set(collectionsAtom, response.data);
            } else {
                throw new Error(response.error || 'Failed to fetch collections');
            }
        } catch (error: any) {
            set(errorAtom, error.message);
            throw error;
        } finally {
            set(isLoadingAtom, false);
        }
    }
);

export const fetchCollectionPreviewAtom = atom(
    null,
    async (get, set, collectionName: string) => {
        try {
            const response = await ChromaDBService.queryDocuments(collectionName, '', { nResults: 5 });
            if (response.success) {
                const documents = response.data.documents.map((doc: string, index: number) => ({
                    id: response.data.ids[index],
                    document: doc,
                    metadata: response.data.metadatas?.[index]
                }));
                
                set(collectionPreviewsAtom, prev => ({
                    ...prev,
                    [collectionName]: documents
                }));
            }
        } catch (error: any) {
            set(errorAtom, error.message);
            throw error;
        }
    }
);

export const fetchEmbeddingModelsAtom = atom(
    null,
    async (get, set) => {
        try {
            const response = await ChromaDBService.getAvailableModels();
            if (response.success) {
                set(availableModelsAtom, response.data);
            } else {
                throw new Error(response.error || 'Failed to fetch embedding models');
            }
        } catch (error: any) {
            set(errorAtom, error.message);
            throw error;
        }
    }
); 