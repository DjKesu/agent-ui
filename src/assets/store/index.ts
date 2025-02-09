import chromadbMetadata from './metadata/chromadb';
import { StoreItemMetadata } from './types';

export { StoreItemMetadata } from './types';
export { default as chromadbMetadata } from './metadata/chromadb';

export const StoreItems: Record<string, StoreItemMetadata> = {
    chromadb: chromadbMetadata
} as const;

export type StoreItemKey = keyof typeof StoreItems; 
