import { ChromaClient, IEmbeddingFunction } from 'chromadb';
import path from 'path';
import { EmbeddingModelRegistry } from './embeddings/registry';
import { EmbeddingModelConfig } from './embeddings/types';

class ChromaDBClient {
    private static instance: ChromaClient | null = null;
    private static persistentPath: string = path.join(process.cwd(), 'data', 'chromadb');

    private constructor() {}

    public static async getInstance(): Promise<ChromaClient> {
        if (!ChromaDBClient.instance) {
            try {
                ChromaDBClient.instance = new ChromaClient({
                    path: ChromaDBClient.persistentPath
                });
                
                // Test the connection
                await ChromaDBClient.instance.heartbeat();
                console.log('ChromaDB connection established successfully');
            } catch (error) {
                console.error('Failed to initialize ChromaDB client:', error);
                throw error;
            }
        }
        return ChromaDBClient.instance;
    }

    public static getEmbeddingFunction(): IEmbeddingFunction {
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

    public static async resetClient(): Promise<void> {
        ChromaDBClient.instance = null;
    }
}

export default ChromaDBClient; 