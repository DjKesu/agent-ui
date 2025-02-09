import { IEmbeddingFunction } from 'chromadb';

export type EmbeddingModelType = 'default'; // | 'openai' | 'huggingface' | 'cohere';

export interface EmbeddingModelConfig {
    type: EmbeddingModelType;
    dimensions?: number;
}

export interface EmbeddingModelInfo {
    id: EmbeddingModelType;
    name: string;
    description: string;
    requiresApiKey: boolean;
    defaultDimensions: number;
}

export interface IEmbeddingModel {
    getFunction(): IEmbeddingFunction;
    getConfig(): EmbeddingModelConfig;
    updateConfig(config: Partial<EmbeddingModelConfig>): void;
} 