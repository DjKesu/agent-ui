import { Metadata, Where, Embedding, Embeddings } from 'chromadb';

export interface VectorDBDocument {
    id: string;
    text: string;
    metadata?: Record<string, any>;
    embedding?: number[];
}

export interface QueryOptions {
    nResults?: number;
    where?: Where;
    whereDocument?: Where;
}

export interface CollectionConfig {
    name: string;
    metadata?: Metadata;
}

export interface QueryResult {
    documents: string[];
    ids: string[];
    distances: number[];
    metadatas?: Metadata[];
}

export interface ServiceResponse<T = void> {
    success: boolean;
    error?: string;
    data?: T;
}

export interface QueryServiceResponse extends ServiceResponse<QueryResult> {
    results?: QueryResult;
}

export interface CollectionServiceResponse extends ServiceResponse<ChromaCollection> {
    collection?: ChromaCollection;
}

export interface CollectionsListResponse extends ServiceResponse<ChromaCollection[]> {
    collections?: ChromaCollection[];
}

export interface StatusResponse extends ServiceResponse {
    status?: string;
    dataPath?: string;
}

export interface VectorDBOperationResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}

export interface ChromaCollection {
    name: string;
    metadata?: Record<string, any>;
}

export interface ChromaDBResponse<T> {
    data: T;
}

export interface MultiQueryResponse {
    ids: string[][];
    distances: number[][];
    documents: (string | null)[][];
    metadatas?: (Metadata | null)[][];
}

export interface ChromaDBClient {
    createCollection(params: { name: string; metadata?: Record<string, any> }): Promise<any>;
    getCollection(params: { name: string }): Promise<any>;
    listCollections(): Promise<ChromaDBResponse<ChromaCollection[]>>;
    deleteCollection(params: { name: string }): Promise<void>;
    heartbeat(): Promise<number>;
} 