import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export interface Collection {
    id: number;
    name: string;
    created_at: string;
    metadata?: Record<string, any>;
}

export interface Document {
    id: number;
    collection_id: number;
    content: string;
    metadata?: Record<string, any>;
    created_at: string;
}

export class SQLiteService {
    private static instance: SQLiteService;
    private db: any;

    private constructor() {}

    public static getInstance(): SQLiteService {
        if (!SQLiteService.instance) {
            SQLiteService.instance = new SQLiteService();
        }
        return SQLiteService.instance;
    }

    public async initialize() {
        if (!this.db) {
            this.db = await open({
                filename: path.join(__dirname, '..', '..', 'data', 'collections.db'),
                driver: sqlite3.Database
            });

            // Create tables if they don't exist
            await this.db.exec(`
                CREATE TABLE IF NOT EXISTS collections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    metadata TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS documents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    collection_id INTEGER,
                    content TEXT NOT NULL,
                    metadata TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (collection_id) REFERENCES collections(id)
                );
            `);
        }
        return this.db;
    }

    public async createCollection(name: string, metadata?: Record<string, any>): Promise<Collection> {
        await this.initialize();
        
        try {
            const result = await this.db.run(
                'INSERT INTO collections (name, metadata) VALUES (?, ?)',
                name,
                metadata ? JSON.stringify(metadata) : null
            );

            const collection = await this.db.get(
                'SELECT * FROM collections WHERE id = ?',
                result.lastID
            );

            return {
                ...collection,
                metadata: collection.metadata ? JSON.parse(collection.metadata) : undefined
            };
        } catch (error: any) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new Error(`Collection "${name}" already exists`);
            }
            throw error;
        }
    }

    public async listCollections(): Promise<Collection[]> {
        await this.initialize();
        
        const collections = await this.db.all('SELECT * FROM collections');
        return collections.map((collection: { metadata: string }) => ({
            ...collection,
            metadata: collection.metadata ? JSON.parse(collection.metadata) : undefined
        }));
    }

    public async getCollection(name: string): Promise<Collection | null> {
        await this.initialize();
        
        const collection = await this.db.get(
            'SELECT * FROM collections WHERE name = ?',
            name
        );

        if (!collection) return null;

        return {
            ...collection,
            metadata: collection.metadata ? JSON.parse(collection.metadata) : undefined
        };
    }

    public async addDocument(collectionName: string, content: string, metadata?: Record<string, any>): Promise<Document> {
        await this.initialize();
        
        const collection = await this.getCollection(collectionName);
        if (!collection) {
            throw new Error(`Collection "${collectionName}" not found`);
        }

        const result = await this.db.run(
            'INSERT INTO documents (collection_id, content, metadata) VALUES (?, ?, ?)',
            collection.id,
            content,
            metadata ? JSON.stringify(metadata) : null
        );

        const document = await this.db.get(
            'SELECT * FROM documents WHERE id = ?',
            result.lastID
        );

        return {
            ...document,
            metadata: document.metadata ? JSON.parse(document.metadata) : undefined
        };
    }

    public async queryCollection(collectionName: string, searchTerm: string): Promise<Document[]> {
        await this.initialize();
        
        const collection = await this.getCollection(collectionName);
        if (!collection) {
            throw new Error(`Collection "${collectionName}" not found`);
        }

        // Simple full-text search
        const documents = await this.db.all(
            'SELECT * FROM documents WHERE collection_id = ? AND content LIKE ?',
            collection.id,
            `%${searchTerm}%`
        );

        return documents.map((doc: { metadata: string }) => ({
            ...doc,
            metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined
        }));
    }

    public async deleteCollection(name: string): Promise<void> {
        await this.initialize();
        
        const collection = await this.getCollection(name);
        if (!collection) {
            throw new Error(`Collection "${name}" not found`);
        }

        await this.db.run('BEGIN TRANSACTION');
        try {
            await this.db.run('DELETE FROM documents WHERE collection_id = ?', collection.id);
            await this.db.run('DELETE FROM collections WHERE id = ?', collection.id);
            await this.db.run('COMMIT');
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    public async heartbeat(): Promise<void> {
        await this.initialize();
        // Test the connection by running a simple query
        await this.db.get('SELECT 1');
    }

    public getDataPath(): string {
        return path.join(__dirname, '..', '..', 'data', 'collections.db');
    }
} 