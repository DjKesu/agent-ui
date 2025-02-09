import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { PluginMetadata, PluginsService } from '../../services/plugins.service';

// Atoms for plugin state
export const pluginsAtom = atom<PluginMetadata[]>([]);
export const pluginStatesAtom = atomWithStorage<Record<string, { isInstalled: boolean; isLoading: boolean; error?: string }>>('pluginStates', {});

// Search and filter atoms
export const searchQueryAtom = atom('');
export const selectedCategoryAtom = atom('all');

// Filtered plugins atom
export const filteredPluginsAtom = atom((get) => {
    const plugins = get(pluginsAtom);
    const searchQuery = get(searchQueryAtom).toLowerCase();
    const selectedCategory = get(selectedCategoryAtom);

    return plugins.filter((plugin) => {
        const matchesSearch =
            plugin.name.toLowerCase().includes(searchQuery) ||
            plugin.description.toLowerCase().includes(searchQuery) ||
            plugin.author.toLowerCase().includes(searchQuery) ||
            plugin.tags.some((tag) => tag.toLowerCase().includes(searchQuery));

        const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });
});

// Action atoms
export const fetchPluginsAtom = atom(null, async (get, set) => {
    try {
        const plugins = await PluginsService.getPlugins();
        set(pluginsAtom, plugins);
    } catch (error: any) {
        console.error('Failed to fetch plugins:', error);
    }
});

export const checkPluginStatusAtom = atom(null, async (get, set, pluginId: string) => {
    const states = get(pluginStatesAtom);
    set(pluginStatesAtom, {
        ...states,
        [pluginId]: { ...states[pluginId], isLoading: true }
    });

    try {
        const status = await PluginsService.getPluginStatus(pluginId);
        set(pluginStatesAtom, {
            ...states,
            [pluginId]: { isInstalled: status.isInstalled, isLoading: false }
        });
    } catch (error: any) {
        set(pluginStatesAtom, {
            ...states,
            [pluginId]: { isInstalled: false, isLoading: false, error: error.message }
        });
    }
});

export const installPluginAtom = atom(null, async (get, set, pluginId: string) => {
    const states = get(pluginStatesAtom);
    set(pluginStatesAtom, {
        ...states,
        [pluginId]: { ...states[pluginId], isLoading: true }
    });

    try {
        await PluginsService.installPlugin(pluginId);
        set(pluginStatesAtom, {
            ...states,
            [pluginId]: { isInstalled: true, isLoading: false }
        });
    } catch (error: any) {
        set(pluginStatesAtom, {
            ...states,
            [pluginId]: { isInstalled: false, isLoading: false, error: error.message }
        });
        throw error;
    }
});

export const uninstallPluginAtom = atom(null, async (get, set, pluginId: string) => {
    const states = get(pluginStatesAtom);
    set(pluginStatesAtom, {
        ...states,
        [pluginId]: { ...states[pluginId], isLoading: true }
    });

    try {
        await PluginsService.uninstallPlugin(pluginId);
        set(pluginStatesAtom, {
            ...states,
            [pluginId]: { isInstalled: false, isLoading: false }
        });
    } catch (error: any) {
        set(pluginStatesAtom, {
            ...states,
            [pluginId]: { ...states[pluginId], isLoading: false, error: error.message }
        });
        throw error;
    }
}); 