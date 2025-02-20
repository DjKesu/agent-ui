import { Ollama } from 'ollama';
import { EventEmitter } from 'events';

class OllamaService extends EventEmitter {
    private static instance: OllamaService;
    private ollama: Ollama;
    private isRunning: boolean = false;

    private constructor() {
        super();
        const host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
        console.log(`Initializing Ollama with host: ${host}`);
        this.ollama = new Ollama({
            host,
        });
    }

    public static getInstance(): OllamaService {
        if (!OllamaService.instance) {
            OllamaService.instance = new OllamaService();
        }
        return OllamaService.instance;
    }

    public async checkStatus(): Promise<boolean> {
        try {
            console.log('Checking Ollama status...');
            const response = await this.ollama.list();
            console.log('Ollama status response:', response);
            this.isRunning = true;
            return true;
        } catch (error) {
            console.error('Ollama status check failed:', error);
            this.isRunning = false;
            throw error;
        }
    }

    public async getInstalledModels(): Promise<any[]> {
        try {
            console.log('Fetching installed models...');
            const response = await this.ollama.list();
            console.log('Installed models response:', response);
            return response.models || [];
        } catch (error) {
            console.error('Error fetching installed models:', error);
            throw error;
        }
    }

    public async generateChat(model: string, messages: any[], options: any = {}): Promise<any> {
        try {
            console.log(`Generating chat with model: ${model}`);
            const response = await this.ollama.chat({
                model,
                messages,
                ...options
            });
            return response;
        } catch (error) {
            console.error('Error generating chat completion:', error);
            throw error;
        }
    }

    public async generateStream(model: string, messages: any[], options: any = {}): Promise<AsyncGenerator<any, void, unknown>> {
        try {
            console.log(`Generating stream with model: ${model}`);
            const response = await this.ollama.chat({
                model,
                messages,
                stream: true,
                ...options
            });
            return response;
        } catch (error) {
            console.error('Error generating stream:', error);
            throw error;
        }
    }

    public async pullModel(model: string): Promise<any> {
        try {
            console.log(`Pulling model: ${model}`);
            const response = await this.ollama.pull({
                model,
                stream: true
            });
            return response;
        } catch (error) {
            console.error('Error pulling model:', error);
            throw error;
        }
    }

    public async deleteModel(model: string): Promise<any> {
        try {
            console.log(`Deleting model: ${model}`);
            const response = await this.ollama.delete({
                model
            });
            return response;
        } catch (error) {
            console.error('Error deleting model:', error);
            throw error;
        }
    }

    public async embedText(model: string, input: string | string[]): Promise<any> {
        try {
            console.log(`Generating embeddings with model: ${model}`);
            const response = await this.ollama.embeddings({
                model,
                prompt: Array.isArray(input) ? input[0] : input
            });
            return response;
        } catch (error) {
            console.error('Error generating embeddings:', error);
            throw error;
        }
    }

    public async getAvailableModels(): Promise<any[]> {
        try {
            console.log('Fetching available models from Ollama library...');
            const response = await fetch('https://ollama.com/library');
            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.statusText}`);
            }

            const html = await response.text();
            const models: any[] = [];

            // Use regex to extract model information since we can't use BeautifulSoup
            const modelRegex = /<li[^>]*x-test-model[^>]*>[\s\S]*?<h2[^>]*>[\s\S]*?<span[^>]*class="group-hover:underline"[^>]*>([^<]+)<\/span>[\s\S]*?<span[^>]*x-test-pull-count[^>]*>([^<]+)<\/span>[\s\S]*?<\/li>/g;
            const sizeRegex = /<span[^>]*x-test-size[^>]*>([^<]+)<\/span>/g;

            let match;
            while ((match = modelRegex.exec(html)) !== null) {
                const [fullMatch, name, pulls] = match;
                
                // Extract sizes
                const sizes: string[] = [];
                let sizeMatch;
                const sizeSearchText = fullMatch.substring(fullMatch.indexOf(pulls));
                while ((sizeMatch = sizeRegex.exec(sizeSearchText)) !== null) {
                    sizes.push(sizeMatch[1]);
                }

                models.push({
                    name: name.trim(),
                    pulls: pulls.trim(),
                    sizes: sizes
                });
            }

            return models;
        } catch (error) {
            console.error('Error fetching available models:', error);
            throw error;
        }
    }
}

export default OllamaService; 