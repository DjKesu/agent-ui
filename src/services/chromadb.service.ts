import axios from 'axios';
import { VectorDBDocument, QueryOptions } from '../types/chromadb';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ChromaDBService {
    static async install() {
        try {
            // First check if backend dependencies are installed
            const checkResponse = await axios.get(`${API_BASE_URL}/api/vectordb/check-dependencies`);
            
            if (!checkResponse.data.installed) {
                // Install backend dependencies
                const installResponse = await axios.post(`${API_BASE_URL}/api/vectordb/install-dependencies`);
                if (!installResponse.data.success) {
                    throw new Error('Failed to install dependencies');
                }
            }

            // Initialize ChromaDB
            const initResponse = await axios.post(`${API_BASE_URL}/api/vectordb/initialize`);
            if (!initResponse.data.success) {
                throw new Error('Failed to initialize ChromaDB');
            }

            return initResponse.data;
        } catch (error: any) {
            console.error('Installation error:', error);
            throw new Error(`Failed to install ChromaDB: ${error.message}`);
        }
    }

    static async uninstall() {
        try {
            // First cleanup data and stop services
            await axios.post(`${API_BASE_URL}/api/vectordb/cleanup`);
            
            // Then uninstall dependencies
            const response = await axios.post(`${API_BASE_URL}/api/vectordb/uninstall-dependencies`);
            if (!response.data.success) {
                throw new Error('Failed to uninstall dependencies');
            }
            
            return { success: true };
        } catch (error: any) {
            console.error('Uninstallation error:', error);
            // Even if there's an error, we want to ensure the status is updated
            return { 
                success: false, 
                error: `Failed to uninstall ChromaDB: ${error.message}`,
                status: 'disconnected',
                isInstalled: false
            };
        }
    }

    static async getStatus() {
        try {
            const response = await axios.get(`${API_BASE_URL}/chromadb/status`);
            return response.data;
        } catch (error: any) {
            // Don't throw an error, just return disconnected status
            return { 
                status: 'disconnected', 
                error: error.message,
                isInstalled: false 
            };
        }
    }

    static async getAvailableModels() {
        const response = await axios.get(`${API_BASE_URL}/api/vectordb/embedding-models`);
        return response.data;
    }

    static async setEmbeddingModel(config: any) {
        const response = await axios.post(`${API_BASE_URL}/api/vectordb/embedding-models/set`, config);
        return response.data;
    }

    static async createCollection(name: string, metadata?: Record<string, any>) {
        const response = await axios.post(`${API_BASE_URL}/api/vectordb/collections`, {
            name,
            metadata
        });
        return response.data;
    }

    static async listCollections() {
        const response = await axios.get(`${API_BASE_URL}/api/vectordb/collections`);
        return response.data;
    }

    static async deleteCollection(name: string) {
        const response = await axios.delete(`${API_BASE_URL}/api/vectordb/collections/${name}`);
        return response.data;
    }

    static async addDocuments(collectionName: string, documents: VectorDBDocument[]) {
        const response = await axios.post(
            `${API_BASE_URL}/api/vectordb/collections/${collectionName}/documents`,
            { documents }
        );
        return response.data;
    }

    static async queryDocuments(collectionName: string, queryText: string, options?: QueryOptions) {
        const response = await axios.post(
            `${API_BASE_URL}/api/vectordb/collections/${collectionName}/query`,
            { queryText, options }
        );
        return response.data;
    }

    static async updateDocuments(collectionName: string, documents: VectorDBDocument[]) {
        const response = await axios.put(
            `${API_BASE_URL}/api/vectordb/collections/${collectionName}/documents`,
            { documents }
        );
        return response.data;
    }

    static async deleteDocuments(collectionName: string, documentIds: string[]) {
        const response = await axios.delete(
            `${API_BASE_URL}/api/vectordb/collections/${collectionName}/documents`,
            { data: { documentIds } }
        );
        return response.data;
    }

    static async getCurrentEmbeddingModel() {
        const response = await axios.get(`${API_BASE_URL}/api/vectordb/embedding-models/current`);
        return response.data;
    }
} 