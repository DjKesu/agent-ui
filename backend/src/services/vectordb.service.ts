import { SQLiteService, Collection, Document } from './sqlite.service';

export interface ServiceResponse {
    success: boolean;
    error?: string;
    status?: string;
    dataPath?: string;
}

export interface CollectionServiceResponse extends ServiceResponse {
    collection?: Collection;
}

export interface CollectionsListResponse extends ServiceResponse {
    collections?: Collection[];
}

export interface QueryServiceResponse extends ServiceResponse {
    data?: Document[];
}

export class VectorDBService {
    private static instance: VectorDBService | null = null;
    private sqliteService: SQLiteService;

    private constructor() {
        this.sqliteService = SQLiteService.getInstance();
    }

    public static getInstance(): VectorDBService {
        if (!VectorDBService.instance) {
            VectorDBService.instance = new VectorDBService();
        }
        return VectorDBService.instance;
    }

    // Collection Management
    async createCollection(name: string, metadata?: Record<string, any>): Promise<CollectionServiceResponse> {
        try {
            console.log(`Creating collection: ${name}`);
            const collection = await this.sqliteService.createCollection(name, metadata);
            return {
                success: true,
                collection
            };
        } catch (error: any) {
            console.error('Error creating collection:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async listCollections(): Promise<CollectionsListResponse> {
        try {
            const collections = await this.sqliteService.listCollections();
            return {
                success: true,
                collections
            };
        } catch (error: any) {
            console.error('Error listing collections:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteCollection(name: string): Promise<ServiceResponse> {
        try {
            await this.sqliteService.deleteCollection(name);
            return {
                success: true
            };
        } catch (error: any) {
            console.error('Error deleting collection:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async addDocuments(collectionName: string, documents: { text: string; metadata?: Record<string, any> }[]): Promise<ServiceResponse> {
        try {
            for (const doc of documents) {
                await this.sqliteService.addDocument(collectionName, doc.text, doc.metadata);
            }
            return {
                success: true
            };
        } catch (error: any) {
            console.error('Error adding documents:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async queryCollection(collectionName: string, query: string): Promise<QueryServiceResponse> {
        try {
            const documents = await this.sqliteService.queryCollection(collectionName, query);
            return {
                success: true,
                data: documents
            };
        } catch (error: any) {
            console.error('Error querying collection:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Agent-specific Operations
    async storeAgentMemory(agentId: string, memory: string, metadata: Record<string, any> = {}): Promise<ServiceResponse> {
        const collectionName = `agent_${agentId}_memory`;
        try {
            // Ensure collection exists
            const collections = await this.listCollections();
            if (!collections.collections?.find(c => c.name === collectionName)) {
                await this.createCollection(collectionName, {
                    type: 'agent_memory',
                    agent_id: agentId
                });
            }

            const document: { text: string; metadata?: Record<string, any> } = {
                text: memory,
                metadata: {
                    ...metadata,
                    agent_id: agentId,
                    memory_type: 'conversation',
                    timestamp: new Date().toISOString()
                }
            };

            return await this.addDocuments(collectionName, [document]);
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async queryAgentMemory(agentId: string, query: string, options: {
        limit?: number,
        memoryType?: string
    } = {}): Promise<QueryServiceResponse> {
        const collectionName = `agent_${agentId}_memory`;
        try {
            return await this.queryCollection(collectionName, query);
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // Utility Methods
    async checkStatus(): Promise<ServiceResponse> {
        try {
            console.log('Checking SQLite status');
            await this.sqliteService.heartbeat();
            return {
                success: true
            };
        } catch (error: any) {
            console.error('Error checking SQLite status:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getStatus(): Promise<ServiceResponse> {
        try {
            await this.sqliteService.heartbeat();
            return { 
                success: true, 
                status: 'connected',
                dataPath: this.sqliteService.getDataPath()
            };
        } catch (error: any) {
            return { 
                success: false, 
                status: 'error',
                error: error.message 
            };
        }
    }
}

export default VectorDBService; 