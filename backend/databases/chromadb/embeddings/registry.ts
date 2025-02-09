import { DefaultEmbeddingModel } from './models';
import { EmbeddingModelType, EmbeddingModelConfig, EmbeddingModelInfo, IEmbeddingModel } from './types';

export class EmbeddingModelRegistry {
    private static instance: EmbeddingModelRegistry;
    private currentModel: IEmbeddingModel;
    private modelInfo: Map<EmbeddingModelType, EmbeddingModelInfo>;

    private constructor() {
        this.currentModel = new DefaultEmbeddingModel();
        this.modelInfo = new Map();
        this.initializeModelInfo();
    }

    private initializeModelInfo() {
        this.modelInfo.set('default', {
            id: 'default',
            name: 'Default Mock Embeddings',
            description: 'Simple mock embedding model for testing (not for production use)',
            requiresApiKey: false,
            defaultDimensions: 1536
        });

        // OpenAI model info commented out for now
        /*
        this.modelInfo.set('openai', {
            id: 'openai',
            name: 'OpenAI Embeddings',
            description: 'Production-ready embeddings using OpenAI\'s models',
            requiresApiKey: true,
            defaultModel: 'text-embedding-ada-002',
            availableModels: ['text-embedding-ada-002'],
            defaultDimensions: 1536
        });
        */
    }

    public static getInstance(): EmbeddingModelRegistry {
        if (!EmbeddingModelRegistry.instance) {
            EmbeddingModelRegistry.instance = new EmbeddingModelRegistry();
        }
        return EmbeddingModelRegistry.instance;
    }

    public getCurrentModel(): IEmbeddingModel {
        return this.currentModel;
    }

    public getAvailableModels(): EmbeddingModelInfo[] {
        return Array.from(this.modelInfo.values());
    }

    public getModelInfo(type: EmbeddingModelType): EmbeddingModelInfo | undefined {
        return this.modelInfo.get(type);
    }

    public async setModel(config: EmbeddingModelConfig): Promise<void> {
        let model: IEmbeddingModel;

        switch (config.type) {
            // OpenAI case commented out for now
            /*
            case 'openai':
                if (!config.apiKey) {
                    throw new Error('OpenAI API key is required');
                }
                model = new OpenAIEmbeddingModel(config.apiKey);
                break;
            */

            case 'default':
            default:
                model = new DefaultEmbeddingModel();
                break;
        }

        model.updateConfig(config);
        this.currentModel = model;
    }
} 