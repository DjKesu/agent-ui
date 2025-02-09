import React from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { ChromaDBService } from '../../services/chromadb.service';
import { EmbeddingModelConfig, EmbeddingModelInfo } from '../../types/chromadb';
import { 
    availableModelsAtom,
    currentModelAtom,
    isLoadingAtom,
    errorAtom,
    fetchEmbeddingModelsAtom
} from '../../store/atoms/chromadb';

export const EmbeddingModelSelector: React.FC = () => {
    const [availableModels] = useAtom(availableModelsAtom);
    const [currentModel, setCurrentModel] = useAtom(currentModelAtom);
    const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
    const [error, setError] = useAtom(errorAtom);
    const fetchEmbeddingModels = useSetAtom(fetchEmbeddingModelsAtom);

    const [selectedModel, setSelectedModel] = React.useState<string>('default');
    const [apiKey, setApiKey] = React.useState<string>('');

    React.useEffect(() => {
        const loadModels = async () => {
            try {
                await fetchEmbeddingModels();
                const currentResponse = await ChromaDBService.getCurrentEmbeddingModel();
                if (currentResponse.success) {
                    setCurrentModel(currentResponse.data);
                    setSelectedModel(currentResponse.data.type);
                }
            } catch (err: any) {
                setError(err.message);
            }
        };
        loadModels();
    }, []);

    const handleModelChange = async (modelType: string) => {
        setSelectedModel(modelType);
        setError(null);

        const modelInfo = availableModels.find(m => m.id === modelType);
        if (!modelInfo?.requiresApiKey) {
            await updateEmbeddingModel(modelType);
        }
    };

    const handleApiKeySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateEmbeddingModel(selectedModel);
    };

    const updateEmbeddingModel = async (modelType: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const config: EmbeddingModelConfig = {
                type: modelType as any,
                apiKey: apiKey || undefined
            };

            const response = await ChromaDBService.setEmbeddingModel(config);
            if (response.success) {
                setCurrentModel(response.data);
            } else {
                throw new Error(response.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedModelInfo = availableModels.find(m => m.id === selectedModel);

    return (
        <div className="space-y-6">
            {/* Model Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Embedding Model
                </label>
                <select
                    value={selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {availableModels.map((model) => (
                        <option key={model.id} value={model.id}>
                            {model.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Model Information */}
            {selectedModelInfo && (
                <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">About this model:</p>
                    <p>{selectedModelInfo.description}</p>
                    {selectedModelInfo.defaultModel && (
                        <p className="mt-1">Default model: {selectedModelInfo.defaultModel}</p>
                    )}
                </div>
            )}

            {/* API Key Input */}
            {selectedModelInfo?.requiresApiKey && (
                <form onSubmit={handleApiKeySubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            disabled={isLoading}
                            placeholder="Enter your API key"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !apiKey}
                        className={`px-4 py-2 rounded-md text-white font-medium ${
                            isLoading || !apiKey
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                        {isLoading ? 'Updating...' : 'Update Model'}
                    </button>
                </form>
            )}

            {error && (
                <div className="text-red-500 text-sm">
                    Error: {error}
                </div>
            )}

            {/* Current Model Info */}
            {currentModel && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Configuration</h4>
                    <pre className="text-xs text-gray-600 overflow-auto">
                        {JSON.stringify(currentModel, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}; 