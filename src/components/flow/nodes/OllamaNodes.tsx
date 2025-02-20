import React, { useEffect, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { useToast } from '../../../components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

interface OllamaModel {
    name: string;
    model: string;
    modified_at: string;
    size: string;
    digest: string;
    details?: any;
}

export function OllamaModelNode({ data }: { data: any }) {
    const [installedModels, setInstalledModels] = useState<OllamaModel[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [modelInput, setModelInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isInstalling, setIsInstalling] = useState(false);
    const [useInContext, setUseInContext] = useState(true);
    const { toast } = useToast();

    const checkOllamaStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/ollama/status`);
            const data = await response.json();
            
            if (data.status === 'disconnected') {
                toast({
                    title: "Ollama Not Running",
                    description: data.error || "Please make sure Ollama is installed and running.",
                    variant: "destructive"
                });
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking Ollama status:', error);
            toast({
                title: "Connection Error",
                description: "Could not connect to the backend server.",
                variant: "destructive"
            });
            return false;
        }
    };

    useEffect(() => {
        const fetchModels = async () => {
            try {
                // First check if Ollama is running
                const isRunning = await checkOllamaStatus();
                if (!isRunning) {
                    setIsLoading(false);
                    return;
                }

                // Fetch installed models
                const installedResponse = await fetch(`${API_BASE_URL}/api/ollama/models/installed`);
                const installedData = await installedResponse.json();
                
                if (installedData.status === 'success') {
                    setInstalledModels(installedData.models);
                }
            } catch (error: any) {
                console.error('Error fetching models:', error);
                toast({
                    title: "Error",
                    description: error.message || "Failed to fetch Ollama models.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchModels();
    }, []);

    const handleModelChange = (value: string) => {
        setSelectedModel(value);
        if (data.onChange) {
            data.onChange({
                model: value,
                useInContext
            });
        }
    };

    const handleInContextChange = (checked: boolean) => {
        setUseInContext(checked);
        if (data.onChange) {
            data.onChange({
                model: selectedModel,
                useInContext: checked
            });
        }
    };

    const handleModelInstall = async () => {
        if (!modelInput) return;

        setIsInstalling(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/ollama/models/pull`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ model: modelInput }),
            });

            if (!response.ok) {
                throw new Error('Failed to install model');
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Parse the chunks and update progress
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.status) {
                                toast({
                                    title: "Installation Progress",
                                    description: data.status,
                                });
                            }
                        } catch (e) {
                            console.error('Error parsing progress data:', e);
                        }
                    }
                }
            }

            // Refresh installed models list
            const installedResponse = await fetch(`${API_BASE_URL}/api/ollama/models/installed`);
            const installedData = await installedResponse.json();
            if (installedData.status === 'success') {
                setInstalledModels(installedData.models);
            }

            toast({
                title: "Success",
                description: `Model ${modelInput} installed successfully`,
            });
            
            // Clear the input and set the selected model
            setModelInput('');
            handleModelChange(modelInput);
        } catch (error: any) {
            console.error('Error installing model:', error);
            toast({
                title: "Error",
                description: error.message || 'Failed to install model',
                variant: "destructive"
            });
        } finally {
            setIsInstalling(false);
        }
    };

    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} />
            
            <Card className="p-4 min-w-[300px]">
                <h3 className="font-semibold mb-4">Ollama Model Configuration</h3>
                
                <div className="space-y-4">
                    <div>
                        <Label>Select Model</Label>
                        <Select
                            value={selectedModel}
                            onValueChange={handleModelChange}
                            disabled={isLoading || isInstalling}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                                {installedModels.map((model) => (
                                    <SelectItem key={model.name} value={model.name}>
                                        {model.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Install New Model</Label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={modelInput}
                                onChange={(e) => setModelInput(e.target.value)}
                                placeholder="Enter model name (e.g., llama2)"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isInstalling}
                            />
                            <Button
                                onClick={handleModelInstall}
                                disabled={!modelInput || isInstalling}
                                className="whitespace-nowrap"
                            >
                                {isInstalling ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Installing...
                                    </>
                                ) : (
                                    'Install'
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="in-context"
                            checked={useInContext}
                            onCheckedChange={handleInContextChange}
                        />
                        <Label htmlFor="in-context">Use In-Context Memory</Label>
                    </div>
                </div>
            </Card>

            <Handle type="source" position={Position.Bottom} />
        </div>
    );
} 