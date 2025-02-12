import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

export interface Plugin {
    id: string;
    name: string;
    description: string;
    version: string;
    isActive: boolean;
    metadata: string; // JSON string of additional metadata
    installedAt: string;
    updatedAt: string;
}

class PluginDatabase {
    private static instance: PluginDatabase | null = null;
    private db: Database | null = null;
    private dbPath: string = path.join(process.cwd(), 'backend', 'data', 'plugins.db');

    private constructor() {}

    public static getInstance(): PluginDatabase {
        if (!PluginDatabase.instance) {
            PluginDatabase.instance = new PluginDatabase();
        }
        return PluginDatabase.instance;
    }

    public async initialize(): Promise<void> {
        if (!this.db) {
            this.db = await open({
                filename: this.dbPath,
                driver: sqlite3.Database
            });

            await this.db.exec(`
                CREATE TABLE IF NOT EXISTS plugins (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    version TEXT NOT NULL,
                    isActive BOOLEAN DEFAULT false,
                    metadata TEXT,
                    installedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
        }
    }

    public async getAllPlugins(): Promise<Plugin[]> {
        await this.initialize();
        return this.db!.all<Plugin[]>('SELECT * FROM plugins');
    }

    public async getActivePlugins(): Promise<Plugin[]> {
        await this.initialize();
        return this.db!.all<Plugin[]>('SELECT * FROM plugins WHERE isActive = true');
    }

    public async getPlugin(id: string): Promise<Plugin | undefined> {
        await this.initialize();
        return this.db!.get<Plugin>('SELECT * FROM plugins WHERE id = ?', [id]);
    }

    public async addPlugin(plugin: Omit<Plugin, 'installedAt' | 'updatedAt'>): Promise<void> {
        await this.initialize();
        await this.db!.run(
            `INSERT INTO plugins (id, name, description, version, isActive, metadata)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [plugin.id, plugin.name, plugin.description, plugin.version, plugin.isActive, plugin.metadata]
        );
    }

    public async updatePlugin(id: string, updates: Partial<Plugin>): Promise<void> {
        await this.initialize();
        const sets: string[] = [];
        const values: any[] = [];

        Object.entries(updates).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'installedAt') {
                sets.push(`${key} = ?`);
                values.push(value);
            }
        });

        sets.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(id);

        await this.db!.run(
            `UPDATE plugins SET ${sets.join(', ')} WHERE id = ?`,
            values
        );
    }

    public async deletePlugin(id: string): Promise<void> {
        await this.initialize();
        await this.db!.run('DELETE FROM plugins WHERE id = ?', [id]);
    }

    public async setPluginActive(id: string, isActive: boolean): Promise<void> {
        await this.initialize();
        await this.db!.run(
            'UPDATE plugins SET isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [isActive, id]
        );
    }
}

export default PluginDatabase; 