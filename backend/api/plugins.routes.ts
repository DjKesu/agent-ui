import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);
const router = Router();

// Plugin template for reference
const PLUGIN_TEMPLATE = {
    id: 'plugin-id',
    name: 'Plugin Name',
    icon: '/store/icons/plugin-icon.png',
    shortDescription: 'Short description (one line)',
    description: 'Detailed description of the plugin functionality',
    tags: ['Tag1', 'Tag2'],
    category: 'rag', // One of: 'llm', 'rag', 'agents', 'workflows', 'tools'
    version: '1.0.0',
    author: 'Your Name',
    links: {
        documentation: 'https://docs.example.com',
        github: 'https://github.com/example/plugin',
        website: 'https://example.com'
    },
    rating: 0,
    downloads: 0,
    installConfig: {
        type: 'python', // One of: 'python', 'npm', 'custom'
        dependencies: ['package1', 'package2'],
        setupCommands: ['optional setup command 1', 'command 2'],
        requiresRestart: false
    }
};

// Sample plugin data with installation configurations
const SAMPLE_PLUGINS = [
    {
        id: 'chromadb',
        name: 'ChromaDB',
        icon: '/store/icons/chroma.png',
        shortDescription: 'Vector Database for AI Applications',
        description: 'ChromaDB is an open-source embedding database that makes it easy to store and query embeddings for AI applications. Perfect for semantic search, recommendations, and more.',
        tags: ['Vector Database', 'AI/ML', 'Embeddings'],
        category: 'rag',
        version: '1.0.0',
        author: 'Agent UI',
        links: {
            documentation: 'https://docs.trychroma.com/',
            github: 'https://github.com/chroma-core/chroma'
        },
        rating: 4.8,
        downloads: 1234,
        installConfig: {
            type: 'python',
            dependencies: ['chromadb', 'chromadb-default-embed'],
            requiresRestart: true
        }
    },
    {
        id: 'openai',
        name: 'OpenAI Models',
        icon: '/store/icons/oai.png',
        shortDescription: 'Access OpenAI\'s powerful language models',
        description: 'Integrate with OpenAI\'s suite of language models including GPT-4, GPT-3.5, and more. Perfect for natural language processing tasks.',
        tags: ['LLM', 'AI/ML', 'NLP'],
        category: 'llm',
        version: '1.0.0',
        author: 'Agent UI',
        links: {
            documentation: 'https://platform.openai.com/docs',
            website: 'https://openai.com'
        },
        rating: 4.9,
        downloads: 5678
    },
    {
        id: 'langchain',
        name: 'LangChain',
        icon: '/store/icons/langchain.png',
        shortDescription: 'Framework for LLM Applications',
        description: 'LangChain is a framework for developing applications powered by language models. Build chatbots, agents, and more with ease.',
        tags: ['Framework', 'AI/ML', 'Agents'],
        category: 'agents',
        version: '1.0.0',
        author: 'Agent UI',
        links: {
            documentation: 'https://python.langchain.com/docs',
            github: 'https://github.com/langchain-ai/langchain'
        },
        rating: 4.7,
        downloads: 3456
    }
];

// GET /api/plugins - List all available plugins
router.get('/', async (req, res) => {
    try {
        res.json({
            success: true,
            data: SAMPLE_PLUGINS
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch plugins'
        });
    }
});

// GET /api/plugins/:id/status - Check installation status of a plugin
router.get('/:id/status', async (req, res) => {
    try {
        const plugin = SAMPLE_PLUGINS.find(p => p.id === req.params.id);
        if (!plugin) {
            return res.json({
                success: true,
                data: {
                    isInstalled: false,
                    isActive: false,
                    error: 'Plugin not found'
                }
            });
        }

        let isInstalled = false;
        let version = null;
        let error = null;

        if (plugin.installConfig) {
            try {
                switch (plugin.installConfig.type) {
                    case 'python':
                        const result = await execAsync(`pip list | grep ${plugin.installConfig.dependencies[0]}`);
                        isInstalled = true;
                        version = result.stdout.match(/\d+\.\d+\.\d+/)?.[0];
                        break;
                    case 'npm':
                        const npmResult = await execAsync(`npm list ${plugin.installConfig.dependencies[0]}`);
                        isInstalled = !npmResult.stderr;
                        version = npmResult.stdout.match(/\d+\.\d+\.\d+/)?.[0];
                        break;
                }
            } catch (err) {
                isInstalled = false;
                error = err instanceof Error ? err.message : 'Failed to check dependencies';
            }
        }

        res.json({
            success: true,
            data: {
                isInstalled,
                version,
                error
            }
        });
    } catch (error: any) {
        // Don't send error status, just return not installed state
        res.json({
            success: true,
            data: {
                isInstalled: false,
                error: error.message || 'Failed to check plugin status'
            }
        });
    }
});

// POST /api/plugins/python/install - Install Python dependencies
router.post('/python/install', async (req, res) => {
    try {
        const { dependencies } = req.body;
        if (!dependencies || !Array.isArray(dependencies)) {
            return res.status(400).json({
                success: false,
                error: 'Dependencies array is required'
            });
        }

        await execAsync(`pip install ${dependencies.join(' ')}`);
        res.json({ success: true, message: 'Dependencies installed successfully' });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: `Failed to install dependencies: ${error.message}`
        });
    }
});

// POST /api/plugins/python/uninstall - Uninstall Python dependencies
router.post('/python/uninstall', async (req, res) => {
    try {
        const { dependencies } = req.body;
        if (!dependencies || !Array.isArray(dependencies)) {
            return res.status(400).json({
                success: false,
                error: 'Dependencies array is required'
            });
        }

        // Check if dependencies are installed before trying to uninstall
        for (const dep of dependencies) {
            try {
                await execAsync(`pip show ${dep}`);
            } catch {
                // If dependency is not found, skip it
                continue;
            }
            await execAsync(`pip uninstall -y ${dep}`);
        }

        res.json({ success: true, message: 'Dependencies uninstalled successfully' });
    } catch (error: any) {
        // If uninstall fails, still return success but with a warning
        res.json({
            success: true,
            warning: `Some dependencies may not have been fully uninstalled: ${error.message}`
        });
    }
});

// POST /api/plugins/npm/install - Install NPM dependencies
router.post('/npm/install', async (req, res) => {
    try {
        const { dependencies } = req.body;
        if (!dependencies || !Array.isArray(dependencies)) {
            return res.status(400).json({
                success: false,
                error: 'Dependencies array is required'
            });
        }

        await execAsync(`npm install ${dependencies.join(' ')}`);
        res.json({ success: true, message: 'Dependencies installed successfully' });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: `Failed to install dependencies: ${error.message}`
        });
    }
});

// POST /api/plugins/npm/uninstall - Uninstall NPM dependencies
router.post('/npm/uninstall', async (req, res) => {
    try {
        const { dependencies } = req.body;
        if (!dependencies || !Array.isArray(dependencies)) {
            return res.status(400).json({
                success: false,
                error: 'Dependencies array is required'
            });
        }

        await execAsync(`npm uninstall ${dependencies.join(' ')}`);
        res.json({ success: true, message: 'Dependencies uninstalled successfully' });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: `Failed to uninstall dependencies: ${error.message}`
        });
    }
});

// POST /api/plugins/custom/install - Run custom installation commands
router.post('/custom/install', async (req, res) => {
    try {
        const { commands } = req.body;
        if (!commands || !Array.isArray(commands)) {
            return res.status(400).json({
                success: false,
                error: 'Commands array is required'
            });
        }

        for (const command of commands) {
            await execAsync(command);
        }
        res.json({ success: true, message: 'Custom installation completed successfully' });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: `Failed to run custom installation: ${error.message}`
        });
    }
});

// GET /api/plugins/template - Get the plugin template
router.get('/template', (req, res) => {
    res.json({
        success: true,
        data: PLUGIN_TEMPLATE
    });
});

// POST /api/plugins/submit - Submit a new plugin
router.post('/submit', async (req, res) => {
    try {
        const plugin = req.body;
        
        // Validate required fields
        const requiredFields = ['id', 'name', 'description', 'category', 'version', 'author'];
        const missingFields = requiredFields.filter(field => !plugin[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate category
        const validCategories = ['llm', 'rag', 'agents', 'workflows', 'tools'];
        if (!validCategories.includes(plugin.category)) {
            return res.status(400).json({
                success: false,
                error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        // Validate installation config if provided
        if (plugin.installConfig) {
            const validTypes = ['python', 'npm', 'custom'];
            if (!validTypes.includes(plugin.installConfig.type)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid installation type. Must be one of: ${validTypes.join(', ')}`
                });
            }

            // Validate dependencies or commands based on type
            if (plugin.installConfig.type !== 'custom' && !plugin.installConfig.dependencies?.length) {
                return res.status(400).json({
                    success: false,
                    error: 'Dependencies are required for python and npm installations'
                });
            }
        }

        // If an icon is provided, ensure the file exists
        if (plugin.icon && !plugin.icon.startsWith('http')) {
            const iconPath = path.join(process.cwd(), 'public', plugin.icon);
            if (!fs.existsSync(iconPath)) {
                return res.status(400).json({
                    success: false,
                    error: 'Icon file not found in public directory'
                });
            }
        }

        // TODO: Save plugin to database or file system
        // For now, we'll just return success
        res.json({
            success: true,
            message: 'Plugin submitted successfully',
            data: plugin
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to submit plugin'
        });
    }
});

export default router; 
