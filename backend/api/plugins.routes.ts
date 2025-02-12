import express from 'express';
import PluginDatabase from '../databases/sqlite/plugins';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);
const router = express.Router();

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

// Get all plugins
router.get('/', async (req, res) => {
    try {
        // Get installed plugins from database
        const installedPlugins = await PluginDatabase.getInstance().getAllPlugins();
        
        // Combine with sample plugins and mark installed ones
        const combinedPlugins = SAMPLE_PLUGINS.map(plugin => {
            const installed = installedPlugins.find(p => p.id === plugin.id);
            return {
                ...plugin,
                isInstalled: !!installed,
                isActive: installed?.isActive || false
            };
        });

        res.json({ success: true, data: combinedPlugins });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get active plugins
router.get('/active', async (req, res) => {
    try {
        const activePlugins = await PluginDatabase.getInstance().getActivePlugins();
        const activePluginDetails = activePlugins.map(active => {
            const samplePlugin = SAMPLE_PLUGINS.find(p => p.id === active.id);
            return {
                ...samplePlugin,
                isInstalled: true,
                isActive: true
            };
        }).filter(Boolean);

        res.json({ success: true, data: activePluginDetails });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get plugin template
router.get('/template', (req, res) => {
    res.json({
        success: true,
        data: PLUGIN_TEMPLATE
    });
});

// Check installation status
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

        const installedPlugin = await PluginDatabase.getInstance().getPlugin(req.params.id);
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
                isActive: installedPlugin?.isActive || false,
                version,
                error
            }
        });
    } catch (error: any) {
        res.json({
            success: true,
            data: {
                isInstalled: false,
                error: error.message || 'Failed to check plugin status'
            }
        });
    }
});

// Install plugin
router.post('/:id/install', async (req, res) => {
    try {
        const plugin = SAMPLE_PLUGINS.find(p => p.id === req.params.id);
        if (!plugin) {
            return res.status(404).json({
                success: false,
                error: 'Plugin not found'
            });
        }

        // Install dependencies if needed
        if (plugin.installConfig) {
            switch (plugin.installConfig.type) {
                case 'python':
                    await execAsync(`pip install ${plugin.installConfig.dependencies.join(' ')}`);
                    break;
                case 'npm':
                    await execAsync(`npm install ${plugin.installConfig.dependencies.join(' ')}`);
                    break;
            }
        }

        // Add to database
        await PluginDatabase.getInstance().addPlugin({
            id: plugin.id,
            name: plugin.name,
            description: plugin.description,
            version: plugin.version,
            isActive: true,
            metadata: JSON.stringify({
                icon: plugin.icon,
                category: plugin.category,
                tags: plugin.tags,
                links: plugin.links
            })
        });

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Uninstall plugin
router.post('/:id/uninstall', async (req, res) => {
    try {
        const plugin = SAMPLE_PLUGINS.find(p => p.id === req.params.id);
        if (!plugin) {
            return res.status(404).json({
                success: false,
                error: 'Plugin not found'
            });
        }

        // Uninstall dependencies if needed
        if (plugin.installConfig) {
            switch (plugin.installConfig.type) {
                case 'python':
                    await execAsync(`pip uninstall -y ${plugin.installConfig.dependencies.join(' ')}`);
                    break;
                case 'npm':
                    await execAsync(`npm uninstall ${plugin.installConfig.dependencies.join(' ')}`);
                    break;
            }
        }

        // Remove from database
        await PluginDatabase.getInstance().deletePlugin(plugin.id);

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Toggle plugin active state
router.post('/:id/toggle', async (req, res) => {
    try {
        const { isActive } = req.body;
        await PluginDatabase.getInstance().setPluginActive(req.params.id, isActive);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 
