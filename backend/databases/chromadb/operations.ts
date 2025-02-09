import { Collection } from 'chromadb';
import ChromaDBClient from './client';
import { VectorDBDocument, QueryOptions, VectorDBOperationResponse } from './types';

export class DocumentOperations {
    private static async getCollection(collectionName: string): Promise<Collection> {
        const client = await ChromaDBClient.getInstance();
        return await client.getCollection({
            name: collectionName,
            embeddingFunction: ChromaDBClient.getEmbeddingFunction()
        });
    }

    public static async addDocuments(
        collectionName: string,
        documents: VectorDBDocument[]
    ): Promise<VectorDBOperationResponse> {
        try {
            const collection = await this.getCollection(collectionName);

            await collection.add({
                ids: documents.map(doc => doc.id),
                documents: documents.map(doc => doc.document),
                metadatas: documents.map(doc => doc.metadata || {})
            });

            return {
                success: true,
                data: { message: `Added ${documents.length} documents successfully` }
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    public static async queryDocuments(
        collectionName: string,
        queryText: string,
        options: QueryOptions = {}
    ): Promise<VectorDBOperationResponse> {
        try {
            const collection = await this.getCollection(collectionName);

            const queryParams: any = {
                queryTexts: [queryText],
                nResults: options.nResults || 10
            };

            // Add optional parameters if they exist
            if (options.where) {
                queryParams.where = options.where;
            }
            if (options.whereDocument) {
                queryParams.whereDocument = options.whereDocument;
            }

            const results = await collection.query(queryParams);

            return {
                success: true,
                data: results
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    public static async updateDocuments(
        collectionName: string,
        documents: VectorDBDocument[]
    ): Promise<VectorDBOperationResponse> {
        try {
            const collection = await this.getCollection(collectionName);

            await collection.upsert({
                ids: documents.map(doc => doc.id),
                documents: documents.map(doc => doc.document),
                metadatas: documents.map(doc => doc.metadata || {})
            });

            return {
                success: true,
                data: { message: `Updated ${documents.length} documents successfully` }
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    public static async deleteDocuments(
        collectionName: string,
        documentIds: string[]
    ): Promise<VectorDBOperationResponse> {
        try {
            const collection = await this.getCollection(collectionName);

            await collection.delete({
                ids: documentIds
            });

            return {
                success: true,
                data: { message: `Deleted ${documentIds.length} documents successfully` }
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    }
} 