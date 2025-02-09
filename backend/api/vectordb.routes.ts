import express from 'express';
import { VectorDBService } from '../services/vectordb.service';
import ChromaDBClient from '../databases/chromadb/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);
const router = express.Router();

// Installation and Setup Routes
router.get('/check-dependencies', async (req, res) => {
    try {
        const result = await execAsync('pip list | grep chromadb');
        res.json({
            installed: result.stdout.includes('chromadb'),
            version: result.stdout.match(/\d+\.\d+\.\d+/)?.[0]
        });
    } catch (error) {
        res.json({ installed: false });
    }
});

router.post('/install-dependencies', async (req, res) => {
    try {
        // Install ChromaDB and its dependencies
        await execAsync('pip install chromadb chromadb-default-embed');
        res.json({ success: true, message: 'Dependencies installed successfully' });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: `Failed to install dependencies: ${error.message}`
        });
    }
});

router.post('/initialize', async (req, res) => {
    try {
        // Create data directory if it doesn't exist
        const dataDir = path.join(process.cwd(), 'data', 'chromadb');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Initialize ChromaDB client
        const client = await ChromaDBClient.getInstance();
        await client.heartbeat();

        res.json({
            success: true,
            message: 'ChromaDB initialized successfully',
            dataPath: dataDir
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: `Failed to initialize ChromaDB: ${error.message}`
        });
    }
});

router.post('/uninstall-dependencies', async (req, res) => {
    try {
        // Uninstall ChromaDB and its dependencies
        await execAsync('pip uninstall -y chromadb chromadb-default-embed');
        res.json({ success: true, message: 'Dependencies uninstalled successfully' });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: `Failed to uninstall dependencies: ${error.message}`
        });
    }
});

// Embedding Model Routes
router.get('/embedding-models', (req, res) => {
    try {
        const models = ChromaDBClient.getAvailableEmbeddingModels();
        res.json({
            success: true,
            data: models
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/embedding-models/current', (req, res) => {
    try {
        const currentModel = ChromaDBClient.getCurrentEmbeddingModel();
        res.json({
            success: true,
            data: currentModel
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/embedding-models/set', async (req, res) => {
    try {
        await ChromaDBClient.setEmbeddingModel(req.body);
        res.json({
            success: true,
            data: ChromaDBClient.getCurrentEmbeddingModel()
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Collection Management Routes
router.post('/collections', async (req, res) => {
    try {
        const result = await VectorDBService.createCollection(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/collections', async (req, res) => {
    try {
        const result = await VectorDBService.listCollections();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/collections/:name', async (req, res) => {
    try {
        const result = await VectorDBService.getCollection(req.params.name);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/collections/:name', async (req, res) => {
    try {
        const result = await VectorDBService.deleteCollection(req.params.name);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Document Operations Routes
router.post('/collections/:name/documents', async (req, res) => {
    try {
        const result = await VectorDBService.addDocuments(req.params.name, req.body.documents);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/collections/:name/query', async (req, res) => {
    try {
        const result = await VectorDBService.queryDocuments(
            req.params.name,
            req.body.queryText,
            req.body.options
        );
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/collections/:name/documents', async (req, res) => {
    try {
        const result = await VectorDBService.updateDocuments(req.params.name, req.body.documents);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/collections/:name/documents', async (req, res) => {
    try {
        const result = await VectorDBService.deleteDocuments(req.params.name, req.body.documentIds);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 