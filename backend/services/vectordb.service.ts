import { CollectionManager } from '../databases/chromadb/collections';
import { DocumentOperations } from '../databases/chromadb/operations';
import { CollectionConfig, VectorDBDocument, QueryOptions, VectorDBOperationResponse } from '../databases/chromadb/types';

export class VectorDBService {
    // Collection Management
    public static async createCollection(config: CollectionConfig): Promise<VectorDBOperationResponse> {
        return await CollectionManager.createCollection(config);
    }

    public static async listCollections(): Promise<VectorDBOperationResponse> {
        return await CollectionManager.listCollections();
    }

    public static async deleteCollection(name: string): Promise<VectorDBOperationResponse> {
        return await CollectionManager.deleteCollection(name);
    }

    public static async getCollection(name: string): Promise<VectorDBOperationResponse> {
        return await CollectionManager.getCollection(name);
    }

    // Document Operations
    public static async addDocuments(
        collectionName: string,
        documents: VectorDBDocument[]
    ): Promise<VectorDBOperationResponse> {
        return await DocumentOperations.addDocuments(collectionName, documents);
    }

    public static async queryDocuments(
        collectionName: string,
        queryText: string,
        options?: QueryOptions
    ): Promise<VectorDBOperationResponse> {
        return await DocumentOperations.queryDocuments(collectionName, queryText, options);
    }

    public static async updateDocuments(
        collectionName: string,
        documents: VectorDBDocument[]
    ): Promise<VectorDBOperationResponse> {
        return await DocumentOperations.updateDocuments(collectionName, documents);
    }

    public static async deleteDocuments(
        collectionName: string,
        documentIds: string[]
    ): Promise<VectorDBOperationResponse> {
        return await DocumentOperations.deleteDocuments(collectionName, documentIds);
    }
} 