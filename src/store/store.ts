import { atom } from 'jotai';
import { Plugin } from '../assets/store/plugins';

export interface PluginState {
    isInstalled: boolean;
    isLoading: boolean;
    error: string | null;
}

// Store the state of each plugin by ID
export const pluginStatesAtom = atom<Record<string, PluginState>>({});

// Selected category in the store
export const selectedCategoryAtom = atom<string>('all');

// Search query in the store
export const searchQueryAtom = atom<string>('');

// Filtered plugins based on category and search
export const filteredPluginsAtom = atom(
    (get) => {
        const selectedCategory = get(selectedCategoryAtom);
        const searchQuery = get(searchQueryAtom);
        const plugins = get(pluginsAtom);

        return plugins.filter(plugin => {
            const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
            const matchesSearch = searchQuery
                ? plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
                : true;
            return matchesCategory && matchesSearch;
        });
    }
);

// Available plugins
export const pluginsAtom = atom<Plugin[]>([]);

// Actions
export const installPluginAtom = atom(
    null,
    async (get, set, plugin: Plugin) => {
        set(pluginStatesAtom, prev => ({
            ...prev,
            [plugin.id]: { ...prev[plugin.id], isLoading: true, error: null }
        }));

        try {
            await plugin.handlers.onInstall();
            set(pluginStatesAtom, prev => ({
                ...prev,
                [plugin.id]: { isInstalled: true, isLoading: false, error: null }
            }));
        } catch (error: any) {
            set(pluginStatesAtom, prev => ({
                ...prev,
                [plugin.id]: { isInstalled: false, isLoading: false, error: error.message }
            }));
            throw error;
        }
    }
);

export const uninstallPluginAtom = atom(
    null,
    async (get, set, plugin: Plugin) => {
        set(pluginStatesAtom, prev => ({
            ...prev,
            [plugin.id]: { ...prev[plugin.id], isLoading: true, error: null }
        }));

        try {
            await plugin.handlers.onUninstall();
            set(pluginStatesAtom, prev => ({
                ...prev,
                [plugin.id]: { isInstalled: false, isLoading: false, error: null }
            }));
        } catch (error: any) {
            set(pluginStatesAtom, prev => ({
                ...prev,
                [plugin.id]: { ...prev[plugin.id], isLoading: false, error: error.message }
            }));
            throw error;
        }
    }
);

export const checkPluginStatusAtom = atom(
    null,
    async (get, set, plugin: Plugin) => {
        try {
            const isInstalled = await plugin.handlers.checkStatus();
            set(pluginStatesAtom, prev => ({
                ...prev,
                [plugin.id]: { isInstalled, isLoading: false, error: null }
            }));
        } catch (error: any) {
            set(pluginStatesAtom, prev => ({
                ...prev,
                [plugin.id]: { isInstalled: false, isLoading: false, error: error.message }
            }));
        }
    }
); 