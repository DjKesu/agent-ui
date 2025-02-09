import { StoreItemMetadata } from './types';
import chromadbMetadata from './metadata/chromadb';
import { ChromaDBService } from '../../services/chromadb.service';

export interface PluginHandlers {
    onInstall: () => Promise<void>;
    onUninstall: () => Promise<void>;
    checkStatus: () => Promise<boolean>;
}

export interface Plugin extends StoreItemMetadata {
    id: string;
    name: string;
    icon: string;
    shortDescription: string;
    description: string;
    tags: string[];
    category: 'all' | 'llm' | 'rag' | 'agents' | 'workflows' | 'tools';
    version: string;
    author: string;
    links: {
        documentation?: string;
        github?: string;
        website?: string;
    };
    handlers: PluginHandlers;
}

export const plugins: Plugin[] = [
    {
        ...chromadbMetadata,
        category: 'rag',
        handlers: {
            onInstall: async () => {
                await ChromaDBService.install();
                const status = await ChromaDBService.getStatus();
                if (status.status !== 'connected') {
                    throw new Error('Failed to install ChromaDB');
                }
            },
            onUninstall: async () => {
                await ChromaDBService.uninstall();
            },
            checkStatus: async () => {
                const status = await ChromaDBService.getStatus();
                return status.status === 'connected';
            }
        }
    }
    // Add more plugins here as they become available
];

// Helper function to get plugins by category
export const getPluginsByCategory = (category: string): Plugin[] => {
    if (category === 'all') {
        return plugins;
    }
    return plugins.filter(plugin => plugin.category === category);
}; 
