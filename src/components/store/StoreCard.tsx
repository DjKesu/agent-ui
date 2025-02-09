import React, { useState } from 'react';
import { PluginMetadata } from '../../services/plugins.service';
import { Download, Star, Clock, CheckCircle2, XCircle, Trash2, Loader2 } from 'lucide-react';

interface StoreCardProps {
    metadata: PluginMetadata;
    isInstalled: boolean;
    isLoading: boolean;
    isActive?: boolean;
    onInstall: () => Promise<void>;
    onUninstall: () => Promise<void>;
}

export const StoreCard: React.FC<StoreCardProps> = ({
    metadata,
    isInstalled,
    isLoading,
    isActive = true,
    onInstall,
    onUninstall
}) => {
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleInstall = async () => {
        try {
            setError(null);
            setIsProcessing(true);
            await onInstall();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to install plugin');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUninstall = async () => {
        try {
            setError(null);
            setIsProcessing(true);
            await onUninstall();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to uninstall plugin');
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusBadge = () => {
        if (!isInstalled) return null;
        
        if (isActive) {
            return (
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Active
                </span>
            );
        }
        
        return (
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Inactive
            </span>
        );
    };

    return (
        <div className="group relative flex flex-col glass-card overflow-hidden h-[360px]">
            <div className="h-[180px] bg-gradient-to-br from-surface-2/50 via-surface-1/30 to-surface-2/40 flex items-center justify-center">
                <div className="w-[100px] h-[100px] flex items-center justify-center">
                    {metadata.icon ? (
                        <img 
                            src={metadata.icon} 
                            alt={metadata.name} 
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-5xl font-light tracking-tight text-accent-1/30 group-hover:text-accent-1/40 transition-colors">
                            {metadata.name[0]}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col flex-1 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-foreground/90 tracking-tight truncate">{metadata.name}</h3>
                        <p className="text-sm text-foreground/60 mt-1 truncate">{metadata.author}</p>
                        {error && (
                            <p className="text-sm text-red-500 mt-1">{error}</p>
                        )}
                    </div>
                    <div className="flex-shrink-0">
                        {isInstalled ? (
                            <div className="flex items-center gap-2">
                                {getStatusBadge()}
                                <button 
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                    onClick={handleUninstall}
                                    disabled={isProcessing || isLoading}
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        ) : (
                            <button 
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                                onClick={handleInstall}
                                disabled={isProcessing || isLoading}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed mt-3 line-clamp-2 h-[40px]">
                    {metadata.description}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-[60px] px-6 flex items-center justify-between text-sm text-foreground/60 border-t border-border/10">
                    <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-primary/30 text-primary/30" />
                        <span className="font-medium">{metadata.rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{metadata.downloads.toLocaleString()} downloads</span>
                    </div>
                </div>
            </div>
        </div>
    );
}; 