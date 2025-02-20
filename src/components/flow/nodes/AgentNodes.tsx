import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { useToast } from '../../ui/use-toast';
import { AgentService } from '../../../services/agent.service';

const agentService = AgentService.getInstance();

export function AgentConfigNode({ data }: { data: any }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const { toast } = useToast();

    const handleCreate = async () => {
        if (!name) {
            toast({
                title: "Error",
                description: "Please enter an agent name",
                variant: "destructive"
            });
            return;
        }

        try {
            const result = await agentService.createAgent(name, description);
            if (result.success && result.data) {
                setStatus('success');
                toast({
                    title: "Success",
                    description: `Agent "${name}" created successfully`,
                });
                // Pass the agent ID to the next node
                if (data.onAgentCreated) {
                    data.onAgentCreated(result.data.id);
                }
            } else {
                setStatus('error');
                toast({
                    title: "Error",
                    description: result.error || "Failed to create agent",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            setStatus('error');
            toast({
                title: "Error",
                description: error.message || "Failed to create agent",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="bg-background border-2 rounded-lg p-4 min-w-[300px]">
            <Handle type="target" position={Position.Top} />
            <div className="space-y-4">
                <h3 className="font-semibold">Configure Agent</h3>
                <div className="space-y-2">
                    <Label>Agent Name</Label>
                    <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter agent name"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter agent description"
                    />
                </div>
                <Button onClick={handleCreate} className="w-full">
                    Create Agent
                </Button>
                {status === 'success' && (
                    <p className="text-sm text-green-500">Agent created successfully!</p>
                )}
                {status === 'error' && (
                    <p className="text-sm text-red-500">Failed to create agent</p>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

export function StoreMemoryNode({ data }: { data: any }) {
    const [memory, setMemory] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const { toast } = useToast();

    const handleStore = async () => {
        if (!data.agentId) {
            toast({
                title: "Error",
                description: "Please configure agent first",
                variant: "destructive"
            });
            return;
        }

        if (!memory) {
            toast({
                title: "Error",
                description: "Please enter memory content",
                variant: "destructive"
            });
            return;
        }

        try {
            const result = await agentService.storeMemory(data.agentId, memory);
            if (result.success) {
                setStatus('success');
                setMemory('');
                toast({
                    title: "Success",
                    description: "Memory stored successfully",
                });
            } else {
                setStatus('error');
                toast({
                    title: "Error",
                    description: result.error || "Failed to store memory",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            setStatus('error');
            toast({
                title: "Error",
                description: error.message || "Failed to store memory",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="bg-background border-2 rounded-lg p-4 min-w-[300px]">
            <Handle type="target" position={Position.Top} />
            <div className="space-y-4">
                <h3 className="font-semibold">Store Agent Memory</h3>
                <div className="space-y-2">
                    <Label>Memory Content</Label>
                    <Textarea 
                        value={memory}
                        onChange={(e) => setMemory(e.target.value)}
                        placeholder="Enter memory content"
                    />
                </div>
                <Button onClick={handleStore} className="w-full" disabled={!data.agentId}>
                    Store Memory
                </Button>
                {!data.agentId && (
                    <p className="text-sm text-yellow-500">Please configure agent first</p>
                )}
                {status === 'success' && (
                    <p className="text-sm text-green-500">Memory stored successfully!</p>
                )}
                {status === 'error' && (
                    <p className="text-sm text-red-500">Failed to store memory</p>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

export function QueryMemoryNode({ data }: { data: any }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const { toast } = useToast();

    const handleQuery = async () => {
        if (!data.agentId) {
            toast({
                title: "Error",
                description: "Please configure agent first",
                variant: "destructive"
            });
            return;
        }

        if (!query) {
            toast({
                title: "Error",
                description: "Please enter a query",
                variant: "destructive"
            });
            return;
        }

        try {
            const result = await agentService.queryMemory(data.agentId, query);
            if (result.success && result.data) {
                setStatus('success');
                setResults(result.data);
                if (result.data.length === 0) {
                    toast({
                        title: "Info",
                        description: "No results found for your query",
                    });
                }
            } else {
                setStatus('error');
                toast({
                    title: "Error",
                    description: result.error || "Failed to query memory",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            setStatus('error');
            toast({
                title: "Error",
                description: error.message || "Failed to query memory",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="bg-background border-2 rounded-lg p-4 min-w-[300px]">
            <Handle type="target" position={Position.Top} />
            <div className="space-y-4">
                <h3 className="font-semibold">Query Agent Memory</h3>
                <div className="space-y-2">
                    <Label>Query</Label>
                    <Input 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter your query"
                    />
                </div>
                <Button onClick={handleQuery} className="w-full" disabled={!data.agentId}>
                    Query Memory
                </Button>
                {!data.agentId && (
                    <p className="text-sm text-yellow-500">Please configure agent first</p>
                )}
                {status === 'success' && results.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <Label>Results:</Label>
                        <div className="max-h-40 overflow-y-auto">
                            {results.map((result, index) => (
                                <div key={index} className="p-2 bg-gray-50 rounded mt-2">
                                    <p className="text-sm">{result.document}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {status === 'error' && (
                    <p className="text-sm text-red-500">Failed to query memory</p>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
} 