import { Database } from 'sqlite';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export interface Agent {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    config: Record<string, any>;
    is_active: boolean;
}

class AgentDatabase {
    private static instance: AgentDatabase;
    private db: Database | null = null;
    private dbPath: string;

    private constructor() {
        this.dbPath = path.join(process.cwd(), 'data', 'agents.db');
    }

    public static getInstance(): AgentDatabase {
        if (!AgentDatabase.instance) {
            AgentDatabase.instance = new AgentDatabase();
        }
        return AgentDatabase.instance;
    }

    async initialize(): Promise<void> {
        if (!this.db) {
            this.db = await open({
                filename: this.dbPath,
                driver: sqlite3.Database
            });

            await this.db.exec(`
                CREATE TABLE IF NOT EXISTS agents (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    config TEXT NOT NULL,
                    is_active INTEGER DEFAULT 1
                );

                CREATE TABLE IF NOT EXISTS agent_collections (
                    agent_id TEXT,
                    collection_name TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    PRIMARY KEY (agent_id, collection_name),
                    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
                );
            `);
        }
    }

    async createAgent(agent: Omit<Agent, 'created_at' | 'updated_at'>): Promise<Agent> {
        await this.initialize();
        const now = new Date().toISOString();
        
        const result = await this.db!.run(
            `INSERT INTO agents (id, name, description, created_at, updated_at, config, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                agent.id,
                agent.name,
                agent.description || null,
                now,
                now,
                JSON.stringify(agent.config),
                agent.is_active ? 1 : 0
            ]
        );

        return {
            ...agent,
            created_at: now,
            updated_at: now
        };
    }

    async getAgent(id: string): Promise<Agent | null> {
        await this.initialize();
        const agent = await this.db!.get('SELECT * FROM agents WHERE id = ?', id);
        if (!agent) return null;
        
        return {
            ...agent,
            config: JSON.parse(agent.config),
            is_active: Boolean(agent.is_active)
        };
    }

    async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
        await this.initialize();
        const now = new Date().toISOString();
        
        const sets: string[] = [];
        const values: any[] = [];

        if (updates.name) {
            sets.push('name = ?');
            values.push(updates.name);
        }
        if (updates.description !== undefined) {
            sets.push('description = ?');
            values.push(updates.description);
        }
        if (updates.config) {
            sets.push('config = ?');
            values.push(JSON.stringify(updates.config));
        }
        if (updates.is_active !== undefined) {
            sets.push('is_active = ?');
            values.push(updates.is_active ? 1 : 0);
        }

        sets.push('updated_at = ?');
        values.push(now);
        values.push(id);

        await this.db!.run(
            `UPDATE agents SET ${sets.join(', ')} WHERE id = ?`,
            values
        );

        return this.getAgent(id);
    }

    async listAgents(): Promise<Agent[]> {
        await this.initialize();
        const agents = await this.db!.all('SELECT * FROM agents');
        return agents.map(agent => ({
            ...agent,
            config: JSON.parse(agent.config),
            is_active: Boolean(agent.is_active)
        }));
    }

    async deleteAgent(id: string): Promise<boolean> {
        await this.initialize();
        const result = await this.db!.run('DELETE FROM agents WHERE id = ?', id);
        return result.changes > 0;
    }

    // Agent Collection Management
    async addAgentCollection(agentId: string, collectionName: string): Promise<void> {
        await this.initialize();
        await this.db!.run(
            `INSERT INTO agent_collections (agent_id, collection_name, created_at)
             VALUES (?, ?, ?)`,
            [agentId, collectionName, new Date().toISOString()]
        );
    }

    async getAgentCollections(agentId: string): Promise<string[]> {
        await this.initialize();
        const collections = await this.db!.all(
            'SELECT collection_name FROM agent_collections WHERE agent_id = ?',
            agentId
        );
        return collections.map(c => c.collection_name);
    }
}

export default AgentDatabase; 