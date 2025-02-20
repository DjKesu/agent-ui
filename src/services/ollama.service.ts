import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class OllamaService {
    static async getAvailableModels() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/ollama/models/available`);
            const data = response.data;
            
            if (data.status === 'success') {
                return {
                    success: true,
                    data: data.models.map((model: any) => ({
                        name: model.name,
                        displayName: model.name,
                        description: `${model.pulls} pulls - Available sizes: ${model.sizes.join(', ')}`,
                        type: 'ollama',
                        sizes: model.sizes
                    }))
                };
            } else {
                return {
                    success: false,
                    error: data.message || 'Failed to fetch available models'
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch available models'
            };
        }
    }
} 