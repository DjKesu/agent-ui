import ChromaDBClient from './client';
import { CollectionConfig, VectorDBOperationResponse } from './types';

export class CollectionManager {
    public static async createCollection(config: CollectionConfig): Promise<VectorDBOperationResponse> {
        try {
            const client = await ChromaDBClient.getInstance();
            const collection = await client.createCollection({
                name: config.name,
                metadata: config.metadata,
                embeddingFunction: ChromaDBClient.getEmbeddingFunction()
            });

            return {
                success: true,
                data: { name: collection.name }
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    public static async listCollections(): Promise<VectorDBOperationResponse> {
        try {
            const client = await ChromaDBClient.getInstance();
            const collections = await client.listCollections();

            return {
                success: true,
                data: collections
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    public static async deleteCollection(name: string): Promise<VectorDBOperationResponse> {
        try {
            const client = await ChromaDBClient.getInstance();
            await client.deleteCollection({ name });

            return {
                success: true,
                data: { message: `Collection ${name} deleted successfully` }
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    public static async getCollection(name: string): Promise<VectorDBOperationResponse> {
        try {
            const client = await ChromaDBClient.getInstance();
            const collection = await client.getCollection({
                name,
                embeddingFunction: ChromaDBClient.getEmbeddingFunction()
            });

            return {
                success: true,
                data: { collection }
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }
} 