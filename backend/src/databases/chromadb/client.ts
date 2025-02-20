import { ChromaClient } from 'chromadb';
import { 
    ChromaDBClient, 
    ChromaCollection, 
    ChromaDBResponse,
    MultiQueryResponse
} from './types';
import { EmbeddingModelRegistry } from './embeddings/registry';
import { EmbeddingModelConfig } from './embeddings/types';

class ChromaDBClientWrapper implements ChromaDBClient {
    private static instance: ChromaDBClientWrapper;
    private client: ChromaClient;

    private constructor() {
        this.client = new ChromaClient({
            path: 'http://localhost:8000'
        });
    }

    public static async getInstance(): Promise<ChromaDBClientWrapper> {
        if (!ChromaDBClientWrapper.instance) {
            ChromaDBClientWrapper.instance = new ChromaDBClientWrapper();
        }
        return ChromaDBClientWrapper.instance;
    }

    public static async resetClient(): Promise<void> {
        ChromaDBClientWrapper.instance = new ChromaDBClientWrapper();
    }

    public async createCollection(params: { name: string; metadata?: Record<string, any> }): Promise<any> {
        return this.client.createCollection({
            ...params,
            embeddingFunction: ChromaDBClientWrapper.getEmbeddingFunction()
        });
    }

    public async getCollection(params: { name: string }): Promise<any> {
        return this.client.getCollection({
            ...params,
            embeddingFunction: ChromaDBClientWrapper.getEmbeddingFunction()
        });
    }

    public async listCollections(): Promise<ChromaDBResponse<ChromaCollection[]>> {
        const collections = await this.client.listCollections() as any[];
        return {
            data: collections.map(collection => ({
                name: collection.name,
                metadata: collection.metadata
            }))
        };
    }

    public async deleteCollection(params: { name: string }): Promise<void> {
        return this.client.deleteCollection(params);
    }

    public async heartbeat(): Promise<number> {
        return this.client.heartbeat();
    }

    public static getEmbeddingFunction() {
        return EmbeddingModelRegistry.getInstance().getCurrentModel().getFunction();
    }

    public static async setEmbeddingModel(config: EmbeddingModelConfig): Promise<void> {
        await EmbeddingModelRegistry.getInstance().setModel(config);
    }

    public static getAvailableEmbeddingModels() {
        return EmbeddingModelRegistry.getInstance().getAvailableModels();
    }

    public static getCurrentEmbeddingModel() {
        return EmbeddingModelRegistry.getInstance().getCurrentModel().getConfig();
    }
}

export default ChromaDBClientWrapper; 