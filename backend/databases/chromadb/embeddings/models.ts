import { IEmbeddingFunction } from 'chromadb';
import { EmbeddingModelConfig, IEmbeddingModel } from './types';

export class DefaultEmbeddingModel implements IEmbeddingModel {
    private config: EmbeddingModelConfig = {
        type: 'default',
        dimensions: 1536,
    };

    public getFunction(): IEmbeddingFunction {
        return {
            generate: async (texts: string[]): Promise<number[][]> => {
                return texts.map(() => 
                    new Array(this.config.dimensions).fill(0).map(() => Math.random())
                );
            }
        };
    }

    public getConfig(): EmbeddingModelConfig {
        return this.config;
    }

    public updateConfig(config: Partial<EmbeddingModelConfig>): void {
        this.config = { ...this.config, ...config };
    }
}

// Other embedding models (OpenAI, HuggingFace, Cohere) will be added later

/*
export class OpenAIEmbeddingModel implements IEmbeddingModel {
    private config: EmbeddingModelConfig = {
        type: 'openai',
        modelName: 'text-embedding-ada-002',
        dimensions: 1536,
        batchSize: 100,
    };
    private openai: OpenAIApi | null = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            this.initOpenAI(apiKey);
        }
    }

    private initOpenAI(apiKey: string) {
        const configuration = new Configuration({ apiKey });
        this.openai = new OpenAIApi(configuration);
    }

    public getFunction(): IEmbeddingFunction {
        if (!this.openai) {
            throw new Error('OpenAI API key not configured');
        }

        return {
            generate: async (texts: string[]): Promise<number[][]> => {
                const embeddings: number[][] = [];
                
                // Process in batches
                for (let i = 0; i < texts.length; i += this.config.batchSize!) {
                    const batch = texts.slice(i, i + this.config.batchSize!);
                    const response = await this.openai!.createEmbedding({
                        model: this.config.modelName!,
                        input: batch,
                    });

                    embeddings.push(...response.data.data.map(item => item.embedding));
                }

                return embeddings;
            }
        };
    }

    public getConfig(): EmbeddingModelConfig {
        return this.config;
    }

    public updateConfig(config: Partial<EmbeddingModelConfig>): void {
        this.config = { ...this.config, ...config };
        if (config.apiKey) {
            this.initOpenAI(config.apiKey);
        }
    }
}
*/

// Add more embedding models here (Hugging Face, Cohere, etc.)
// Example:
/*
export class HuggingFaceEmbeddingModel implements IEmbeddingModel {
    // Implementation
}

export class CohereEmbeddingModel implements IEmbeddingModel {
    // Implementation
}
*/ 