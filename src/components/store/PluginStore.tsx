import React, { useEffect, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Search, Plus } from 'lucide-react';
import { StoreCard } from './StoreCard';
import { Button } from '../ui/button';
import SubmitPluginDialog from './SubmitPluginDialog';
import {
    pluginsAtom,
    pluginStatesAtom,
    searchQueryAtom,
    selectedCategoryAtom,
    filteredPluginsAtom,
    fetchPluginsAtom,
    installPluginAtom,
    uninstallPluginAtom,
    checkPluginStatusAtom
} from '../../store/atoms/plugins';

const CATEGORIES = [
    { id: 'all', name: 'All Plugins' },
    { id: 'llm', name: 'LLM Models' },
    { id: 'rag', name: 'RAG & Vector Stores' },
    { id: 'agents', name: 'Agents' },
    { id: 'workflows', name: 'Workflows' },
    { id: 'tools', name: 'Tools & Utilities' }
];

export const PluginStore: React.FC = () => {
    const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
    const [selectedCategory, setSelectedCategory] = useAtom(selectedCategoryAtom);
    const pluginStates = useAtomValue(pluginStatesAtom);
    const filteredPlugins = useAtomValue(filteredPluginsAtom);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    
    const fetchPlugins = useSetAtom(fetchPluginsAtom);
    const installPlugin = useSetAtom(installPluginAtom);
    const uninstallPlugin = useSetAtom(uninstallPluginAtom);
    const checkPluginStatus = useSetAtom(checkPluginStatusAtom);

    // Fetch plugins on mount
    useEffect(() => {
        fetchPlugins();
    }, [fetchPlugins]);

    // Check status of all plugins
    useEffect(() => {
        filteredPlugins.forEach(plugin => {
            checkPluginStatus(plugin.id);
        });
    }, [filteredPlugins, checkPluginStatus]);

    return (
        <div className="flex flex-col min-h-[calc(100vh-theme(spacing.24))] overflow-hidden bg-background">
            {/* Background gradient effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[40rem] left-1/2 transform -translate-x-1/2 w-[80rem] h-[80rem] opacity-30">
                    <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-primary/5 to-transparent" />
                </div>
            </div>

            {/* Header Section */}
            <div className="px-8 pt-6 pb-4">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-4xl font-medium tracking-tight text-foreground/90">Plugin Store</h1>
                    <Button 
                        onClick={() => setShowSubmitDialog(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Submit Plugin
                    </Button>
                </div>
                <p className="text-lg text-foreground/70 tracking-wide">
                    Discover and install plugins to enhance your agent capabilities
                </p>
            </div>

            {/* Search and Filters */}
            <div className="px-8 py-4">
                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                        <input
                            type="text"
                            placeholder="Search plugins..."
                            className="w-full pl-10 pr-4 py-3 text-base bg-card/30 backdrop-blur-sm rounded-xl
                                     text-foreground placeholder:text-foreground/40
                                     focus:outline-none focus:ring-2 focus:ring-primary/30
                                     border border-border/50 hover:border-border/80
                                     transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {CATEGORIES.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-4 py-2 rounded-lg text-sm transition-all
                                    ${selectedCategory === category.id
                                        ? 'bg-primary/15 text-primary font-medium border border-primary/20'
                                        : 'text-foreground/70 hover:text-foreground hover:bg-white/[0.03] border border-transparent'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Plugin Grid */}
            <div className="flex-1 overflow-y-auto px-8 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 max-w-[1600px] mx-auto">
                    {filteredPlugins.map((plugin) => {
                        const state = pluginStates[plugin.id] || { isInstalled: false, isLoading: false };
                        return (
                            <StoreCard
                                key={plugin.id}
                                metadata={plugin}
                                isInstalled={state.isInstalled}
                                isLoading={state.isLoading}
                                onInstall={() => installPlugin(plugin.id)}
                                onUninstall={() => uninstallPlugin(plugin.id)}
                            />
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredPlugins.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold mb-2">No plugins found</h3>
                        <p className="text-foreground/60">
                            {searchQuery
                                ? `No plugins match your search "${searchQuery}"`
                                : 'There are no plugins available in this category yet.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Submit Plugin Dialog */}
            <SubmitPluginDialog 
                open={showSubmitDialog} 
                onOpenChange={setShowSubmitDialog} 
            />
        </div>
    );
}; 
