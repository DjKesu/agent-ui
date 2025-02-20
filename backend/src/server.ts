import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import vectorDBRoutes from './api/vectordb.routes';
import pluginsRoutes from './api/plugins.routes';
import ollamaRoutes from './api/ollama.routes';
import agentsRoutes from './api/agents.routes';
import ChromaDBClientWrapper from './databases/chromadb/client';
import OllamaService from './services/ollama.service';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Serve static files from the public directory
app.use('/store', express.static(path.join(process.cwd(), '..', 'public', 'store')));

// Create data directory for ChromaDB if it doesn't exist
const dataDir = path.join(process.cwd(), 'data', 'chromadb');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// ChromaDB Status endpoint
app.get('/chromadb/status', async (req, res) => {
    try {
        const client = await ChromaDBClientWrapper.getInstance();
        
        try {
            await client.heartbeat();
            res.json({ 
                status: 'connected',
                dataPath: dataDir
            });
        } catch (heartbeatError) {
            // If heartbeat fails, return disconnected but don't throw
            res.json({ 
                status: 'disconnected',
                error: 'ChromaDB service is not responding',
                isInstalled: false
            });
        }
    } catch (error: any) {
        // Don't send 500, just return disconnected state
        res.json({ 
            status: 'disconnected',
            error: error.message || 'Failed to connect to ChromaDB',
            isInstalled: false
        });
    }
});

// Ollama Status endpoint
app.get('/ollama/status', async (req, res) => {
    try {
        const ollamaService = OllamaService.getInstance();
        try {
            await ollamaService.checkStatus();
            res.json({ 
                status: 'connected',
                message: 'Ollama service is running'
            });
        } catch (error: any) {
            console.error('Ollama status check error:', error);
            res.json({ 
                status: 'disconnected',
                error: error.message || 'Ollama service is not running',
                isInstalled: false
            });
        }
    } catch (error: any) {
        console.error('Ollama service error:', error);
        res.json({ 
            status: 'disconnected',
            error: error.message || 'Failed to connect to Ollama',
            isInstalled: false
        });
    }
});

// ChromaDB Cleanup endpoint
app.post('/chromadb/cleanup', async (req, res) => {
    try {
        // Reset the ChromaDB client
        await ChromaDBClientWrapper.resetClient();

        // Remove the data directory
        if (fs.existsSync(dataDir)) {
            fs.rmSync(dataDir, { recursive: true, force: true });
        }

        res.json({ 
            success: true, 
            message: 'ChromaDB data cleaned up successfully' 
        });
    } catch (error: any) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Vector DB routes
app.use('/api/vectordb', vectorDBRoutes);

// Plugins routes
app.use('/api/plugins', pluginsRoutes);

// Ollama routes
app.use('/api/ollama', ollamaRoutes);

// Agents routes
app.use('/api/agents', agentsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 