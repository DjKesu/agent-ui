export interface VectorDBDocument {
    id: string;
    document: string;
    metadata?: Record<string, any>;
}

export interface QueryOptions {
    nResults?: number;
    filter?: Record<string, any>;
}

export interface Collection {
    name: string;
    metadata?: Record<string, any>;
}

export interface QueryResult {
    documents: string[];
    ids: string[];
    distances: number[];
    metadatas?: Record<string, any>[];
}

export interface ChromaDBStatus {
    status: 'connected' | 'disconnected';
    dataPath?: string;
    error?: string;
}

export interface OperationResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}

export type EmbeddingModelType = 'default' | 'chroma' | 'lancedb' | 'huggingface' | 'openai' | 'cohere';

export interface EmbeddingModelInfo {
    id: EmbeddingModelType;
    name: string;
    description: string;
    requiresApiKey: boolean;
    defaultModel?: string;
    availableModels?: string[];
    defaultDimensions: number;
}

export interface EmbeddingModelConfig {
    type: EmbeddingModelType;
    apiKey?: string;
    dimensions?: number;
    modelName?: string;
} 