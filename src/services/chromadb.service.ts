import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ChromaDBService {
    // Agent Memory Operations
    static async storeAgentMemory(agentId: string, memory: string, metadata?: Record<string, any>) {
        const response = await axios.post(`${API_BASE_URL}/api/vectordb/agent/${agentId}/memory`, {
            memory,
            metadata
        });
        return response.data;
    }

    static async queryAgentMemory(agentId: string, query: string, options?: {
        limit?: number,
        memoryType?: string
    }) {
        const response = await axios.post(`${API_BASE_URL}/api/vectordb/agent/${agentId}/query`, {
            query,
            ...options
        });
        return response.data;
    }

    // Collection Operations (for advanced workflow nodes)
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

    static async queryCollection(name: string, query: string, options?: {
        nResults?: number,
        where?: Record<string, any>
    }) {
        const response = await axios.post(`${API_BASE_URL}/api/vectordb/collections/${name}/query`, {
            query,
            ...options
        });
        return response.data;
    }

    static async queryDocuments(collectionName: string, query: string, options?: {
        nResults?: number,
        where?: Record<string, any>
    }) {
        const response = await axios.post(`${API_BASE_URL}/api/vectordb/collections/${collectionName}/query`, {
            query,
            ...options
        });
        return response.data;
    }

    static async addToCollection(name: string, documents: string[], metadata?: Record<string, any>[]) {
        const response = await axios.post(`${API_BASE_URL}/api/vectordb/collections/${name}/add`, {
            documents,
            metadata
        });
        return response.data;
    }
} 