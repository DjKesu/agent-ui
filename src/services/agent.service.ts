import { ChromaDBService } from './chromadb.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Agent {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    config: Record<string, any>;
    is_active: boolean;
}

export interface AgentMemory {
    id: string;
    document: string;
    metadata: {
        source: string;
        timestamp: string;
    };
}

export class AgentService {
    private static instance: AgentService;

    private constructor() {}

    public static getInstance(): AgentService {
        if (!AgentService.instance) {
            AgentService.instance = new AgentService();
        }
        return AgentService.instance;
    }

    public async createAgent(name: string, description: string): Promise<{ success: boolean; data?: Agent; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/api/agents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    config: {
                        type: 'chromadb'
                    },
                    is_active: true
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.error || 'Failed to create agent' };
            }
        } catch (error: any) {
            return { success: false, error: error.message || 'Failed to create agent' };
        }
    }

    public async storeMemory(agentId: string, content: string): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await ChromaDBService.storeAgentMemory(agentId, content, {
                source: 'user-input',
                timestamp: new Date().toISOString()
            });
            
            if (response.success) {
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Failed to store memory' };
            }
        } catch (error: any) {
            return { success: false, error: error.message || 'Failed to store memory' };
        }
    }

    public async queryMemory(agentId: string, query: string): Promise<{ success: boolean; data?: AgentMemory[]; error?: string }> {
        try {
            const response = await ChromaDBService.queryAgentMemory(agentId, query);
            if (response.success) {
                return {
                    success: true,
                    data: response.data.map((doc: any) => ({
                        id: doc.id,
                        document: doc.document,
                        metadata: doc.metadata
                    }))
                };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error: any) {
            return { success: false, error: error.message || 'Failed to query memory' };
        }
    }

    public async listAgents(): Promise<{ success: boolean; data?: Agent[]; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/api/agents`);
            const data = await response.json();
            
            if (response.ok) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.error || 'Failed to list agents' };
            }
        } catch (error: any) {
            return { success: false, error: error.message || 'Failed to list agents' };
        }
    }

    public async getAgent(id: string): Promise<{ success: boolean; data?: Agent; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/api/agents/${id}`);
            const data = await response.json();
            
            if (response.ok) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.error || 'Failed to get agent' };
            }
        } catch (error: any) {
            return { success: false, error: error.message || 'Failed to get agent' };
        }
    }
} 