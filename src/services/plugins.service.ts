import { ChromaDBService } from './chromadb.service';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface PluginMetadata {
    id: string;
    name: string;
    description: string;
    shortDescription?: string;
    icon?: string;
    author: string;
    version: string;
    category: 'llm' | 'rag' | 'agents' | 'workflows' | 'tools';
    tags: string[];
    links: {
        documentation?: string;
        github?: string;
        website?: string;
    };
    rating: number;
    downloads: number;
    installConfig?: {
        type: 'python' | 'npm' | 'custom';
        dependencies?: string[];
        setupCommands?: string[];
        requiresRestart?: boolean;
    };
}

export interface PluginStatus {
    isInstalled: boolean;
    isActive?: boolean;
    version?: string;
    error?: string;
}

export class PluginsService {
    private static pluginHandlers: Record<string, {
        install: () => Promise<void>;
        uninstall: () => Promise<void>;
        checkStatus: () => Promise<PluginStatus>;
    }> = {
        'chromadb': {
            install: async () => {
                await ChromaDBService.install();
            },
            uninstall: async () => {
                await ChromaDBService.uninstall();
            },
            checkStatus: async () => {
                const status = await ChromaDBService.getStatus();
                return {
                    isInstalled: status.status === 'connected',
                    isActive: status.status === 'connected',
                    error: status.error
                };
            }
        },
        // Add more plugin handlers here
    };

    static async getPlugins(): Promise<PluginMetadata[]> {
        const response = await fetch(`${API_BASE_URL}/api/plugins`);
        if (!response.ok) {
            throw new Error('Failed to fetch plugins');
        }
        const data = await response.json();
        return data.data;
    }

    static async getPluginStatus(pluginId: string): Promise<PluginStatus> {
        try {
            // First check if we have a custom handler for this plugin
            const handler = this.pluginHandlers[pluginId];
            if (handler) {
                try {
                    return await handler.checkStatus();
                } catch (error) {
                    // If custom handler fails, return a safe disconnected state
                    return {
                        isInstalled: false,
                        isActive: false,
                        error: error instanceof Error ? error.message : 'Failed to check status'
                    };
                }
            }

            // Fallback to generic status check
            const response = await fetch(`${API_BASE_URL}/api/plugins/${pluginId}/status`);
            if (!response.ok) {
                return {
                    isInstalled: false,
                    isActive: false,
                    error: 'Failed to fetch plugin status'
                };
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            // Return a safe disconnected state if anything fails
            return {
                isInstalled: false,
                isActive: false,
                error: error instanceof Error ? error.message : 'Failed to check status'
            };
        }
    }

    static async installPlugin(pluginId: string): Promise<void> {
        // First check if we have a custom handler for this plugin
        const handler = this.pluginHandlers[pluginId];
        if (handler) {
            await handler.install();
            return;
        }

        // Get plugin metadata to check installation requirements
        const plugins = await this.getPlugins();
        const plugin = plugins.find(p => p.id === pluginId);
        if (!plugin) {
            throw new Error('Plugin not found');
        }

        // Handle different installation types
        if (plugin.installConfig) {
            switch (plugin.installConfig.type) {
                case 'python':
                    await this.installPythonDependencies(plugin.installConfig.dependencies || []);
                    break;
                case 'npm':
                    await this.installNpmDependencies(plugin.installConfig.dependencies || []);
                    break;
                case 'custom':
                    await this.runCustomInstallation(plugin.installConfig.setupCommands || []);
                    break;
            }
        }

        // Call the generic install endpoint
        const response = await fetch(`${API_BASE_URL}/api/plugins/${pluginId}/install`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Failed to install plugin');
        }
    }

    static async uninstallPlugin(pluginId: string): Promise<void> {
        try {
            // First check if we have a custom handler for this plugin
            const handler = this.pluginHandlers[pluginId];
            if (handler) {
                try {
                    await handler.uninstall();
                    return;
                } catch (error) {
                    console.error('Custom uninstall failed:', error);
                    // Continue with generic uninstall as fallback
                }
            }

            // Get plugin metadata to check uninstallation requirements
            const plugins = await this.getPlugins();
            const plugin = plugins.find(p => p.id === pluginId);
            if (!plugin) {
                throw new Error('Plugin not found');
            }

            // Handle different installation types for cleanup
            if (plugin.installConfig) {
                try {
                    switch (plugin.installConfig.type) {
                        case 'python':
                            await this.uninstallPythonDependencies(plugin.installConfig.dependencies || []);
                            break;
                        case 'npm':
                            await this.uninstallNpmDependencies(plugin.installConfig.dependencies || []);
                            break;
                    }
                } catch (error) {
                    console.error('Dependency cleanup failed:', error);
                    // Continue with generic uninstall
                }
            }

            // Call the generic uninstall endpoint
            const response = await fetch(`${API_BASE_URL}/api/plugins/${pluginId}/uninstall`, {
                method: 'POST',
            });
            
            if (!response.ok) {
                throw new Error('Failed to uninstall plugin');
            }
        } catch (error) {
            // Ensure the error is properly propagated
            throw error instanceof Error ? error : new Error('Failed to uninstall plugin');
        }
    }

    private static async installPythonDependencies(dependencies: string[]): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/plugins/python/install`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dependencies })
        });
        if (!response.ok) {
            throw new Error('Failed to install Python dependencies');
        }
    }

    private static async uninstallPythonDependencies(dependencies: string[]): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/plugins/python/uninstall`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dependencies })
        });
        if (!response.ok) {
            throw new Error('Failed to uninstall Python dependencies');
        }
    }

    private static async installNpmDependencies(dependencies: string[]): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/plugins/npm/install`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dependencies })
        });
        if (!response.ok) {
            throw new Error('Failed to install NPM dependencies');
        }
    }

    private static async uninstallNpmDependencies(dependencies: string[]): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/plugins/npm/uninstall`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dependencies })
        });
        if (!response.ok) {
            throw new Error('Failed to uninstall NPM dependencies');
        }
    }

    private static async runCustomInstallation(commands: string[]): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/plugins/custom/install`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commands })
        });
        if (!response.ok) {
            throw new Error('Failed to run custom installation');
        }
    }
} 