export interface StoreItemMetadata {
    id: string;
    name: string;
    icon: string;
    shortDescription: string;
    description: string;
    tags: string[];
    category: string;
    version: string;
    author: string;
    links: {
        documentation?: string;
        github?: string;
        website?: string;
    };
}

export interface StoreItem extends StoreItemMetadata {
    isInstalled: boolean;
    isLoading: boolean;
    error?: string;
} 