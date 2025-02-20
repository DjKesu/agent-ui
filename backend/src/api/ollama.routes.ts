import { Router } from 'express';
import OllamaService from '../services/ollama.service';

const router = Router();
const ollamaService = OllamaService.getInstance();

// Check Ollama status
router.get('/status', async (req, res) => {
    try {
        await ollamaService.checkStatus();
        res.json({ 
            status: 'success', 
            message: 'Ollama server is running' 
        });
    } catch (error: any) {
        res.json({ 
            status: 'error', 
            message: error.message || 'Ollama server is not running',
            isInstalled: false
        });
    }
});

// Get installed models
router.get('/models/installed', async (req, res) => {
    try {
        const models = await ollamaService.getInstalledModels();
        res.json({ status: 'success', models });
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error', 
            message: error.message || 'Failed to fetch installed models' 
        });
    }
});

// Pull a model
router.post('/models/pull', async (req, res) => {
    try {
        const { model } = req.body;
        if (!model) {
            return res.status(400).json({
                status: 'error',
                message: 'Model name is required'
            });
        }

        const stream = await ollamaService.pullModel(model);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of stream) {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        res.end();
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error', 
            message: error.message || 'Failed to pull model' 
        });
    }
});

// Delete a model
router.delete('/models/:model', async (req, res) => {
    try {
        const { model } = req.params;
        await ollamaService.deleteModel(model);
        res.json({ 
            status: 'success', 
            message: `Model ${model} deleted successfully` 
        });
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error', 
            message: error.message || 'Failed to delete model' 
        });
    }
});

// Generate chat completion
router.post('/chat', async (req, res) => {
    try {
        const { model, messages, stream, ...options } = req.body;
        if (!model || !messages) {
            return res.status(400).json({
                status: 'error',
                message: 'Model and messages are required'
            });
        }

        if (stream) {
            const streamResponse = await ollamaService.generateStream(model, messages, options);
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            for await (const chunk of streamResponse) {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            }
            res.end();
        } else {
            const response = await ollamaService.generateChat(model, messages, options);
            res.json({ status: 'success', response });
        }
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error', 
            message: error.message || 'Failed to generate chat completion' 
        });
    }
});

// Generate embeddings
router.post('/embeddings', async (req, res) => {
    try {
        const { model, input } = req.body;
        if (!model || !input) {
            return res.status(400).json({
                status: 'error',
                message: 'Model and input are required'
            });
        }

        const response = await ollamaService.embedText(model, input);
        res.json({ status: 'success', response });
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error', 
            message: error.message || 'Failed to generate embeddings' 
        });
    }
});

// Get available models from library
router.get('/models/available', async (req, res) => {
    try {
        const models = await ollamaService.getAvailableModels();
        res.json({ 
            status: 'success', 
            models 
        });
    } catch (error: any) {
        res.status(500).json({ 
            status: 'error', 
            message: error.message || 'Failed to fetch available models' 
        });
    }
});

export default router; 