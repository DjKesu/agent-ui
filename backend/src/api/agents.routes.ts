import express from 'express';
import AgentDatabase from '../databases/sqlite/agents';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const agentDb = AgentDatabase.getInstance();

// Create a new agent
router.post('/', async (req, res) => {
    try {
        const { name, description, config } = req.body;
        const agent = await agentDb.createAgent({
            id: uuidv4(),
            name,
            description,
            config: config || {},
            is_active: true
        });
        res.json({ success: true, data: agent });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all agents
router.get('/', async (req, res) => {
    try {
        const agents = await agentDb.listAgents();
        res.json({ success: true, data: agents });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get a specific agent
router.get('/:id', async (req, res) => {
    try {
        const agent = await agentDb.getAgent(req.params.id);
        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }
        res.json({ success: true, data: agent });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update an agent
router.patch('/:id', async (req, res) => {
    try {
        const { name, description, config, is_active } = req.body;
        const agent = await agentDb.updateAgent(req.params.id, {
            name,
            description,
            config,
            is_active
        });
        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }
        res.json({ success: true, data: agent });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete an agent
router.delete('/:id', async (req, res) => {
    try {
        const success = await agentDb.deleteAgent(req.params.id);
        if (!success) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get agent collections
router.get('/:id/collections', async (req, res) => {
    try {
        const collections = await agentDb.getAgentCollections(req.params.id);
        res.json({ success: true, data: collections });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add collection to agent
router.post('/:id/collections', async (req, res) => {
    try {
        const { collectionName } = req.body;
        await agentDb.addAgentCollection(req.params.id, collectionName);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 