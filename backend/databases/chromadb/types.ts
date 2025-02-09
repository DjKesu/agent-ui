import { Metadata, Where } from 'chromadb';

export interface VectorDBDocument {
    id: string;
    document: string;
    metadata?: Metadata;
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

export interface VectorDBOperationResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
} 