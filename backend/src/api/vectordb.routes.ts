import { Router } from 'express';
import VectorDBService from '../services/vectordb.service';
import { VectorDBDocument, QueryResult } from '../databases/chromadb/types';

const router = Router();
const vectorDB = VectorDBService.getInstance();

// List collections
router.get('/collections', async (req, res) => {
    try {
        const result = await vectorDB.listCollections();
        if (result.success) {
            res.json({ 
                status: 'success',
                collections: result.collections 
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: result.error 
            });
        }
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error',
            error: error.message 
        });
    }
});

// Create collection
router.post('/collections/:name', async (req, res) => {
    try {
        const result = await vectorDB.createCollection(req.params.name, req.body.metadata);
        if (result.success) {
            res.json({ 
                status: 'success',
                collection: result.collection 
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: result.error 
            });
        }
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error',
            error: error.message 
        });
    }
});

// Add documents to collection
router.post('/collections/:name/documents', async (req, res) => {
    try {
        const { documents } = req.body;
        if (!Array.isArray(documents)) {
            return res.status(400).json({
                status: 'error',
                error: 'Documents must be an array'
            });
        }

        const result = await vectorDB.addDocuments(req.params.name, documents);
        if (result.success) {
            res.json({ 
                status: 'success' 
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: result.error 
            });
        }
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error',
            error: error.message 
        });
    }
});

// Query collection
router.post('/collections/:name/query', async (req, res) => {
    try {
        const { query, n_results = 10 } = req.body;
        if (!query) {
            return res.status(400).json({
                status: 'error',
                error: 'Query is required'
            });
        }

        const result = await vectorDB.queryCollection(req.params.name, query);
        if (result.success && result.data) {
            res.json({ 
                status: 'success',
                results: result.data 
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: result.error 
            });
        }
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error',
            error: error.message 
        });
    }
});

// Delete collection
router.delete('/collections/:name', async (req, res) => {
    try {
        const result = await vectorDB.deleteCollection(req.params.name);
        if (result.success) {
            res.json({ 
                status: 'success' 
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: result.error 
            });
        }
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error',
            error: error.message 
        });
    }
});

// Store agent memory
router.post('/agents/:agentId/memory', async (req, res) => {
    try {
        const { memory, metadata = {} } = req.body;
        if (!memory) {
            return res.status(400).json({
                status: 'error',
                error: 'Memory content is required'
            });
        }

        const result = await vectorDB.storeAgentMemory(req.params.agentId, memory, metadata);
        if (result.success) {
            res.json({ 
                status: 'success' 
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: result.error 
            });
        }
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error',
            error: error.message 
        });
    }
});

// Query agent memory
router.post('/agents/:agentId/memory/query', async (req, res) => {
    try {
        const { query, limit, memoryType } = req.body;
        if (!query) {
            return res.status(400).json({
                status: 'error',
                error: 'Query is required'
            });
        }

        const result = await vectorDB.queryAgentMemory(req.params.agentId, query, { limit, memoryType });
        if (result.success) {
            res.json({ 
                status: 'success',
                results: result.data 
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: result.error 
            });
        }
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error',
            error: error.message 
        });
    }
});

// Get VectorDB status
router.get('/status', async (req, res) => {
    try {
        const result = await vectorDB.getStatus();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error',
            error: error.message 
        });
    }
});

export default router; 