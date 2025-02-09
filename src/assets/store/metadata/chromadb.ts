import { StoreItemMetadata } from '../types';

const chromadbMetadata: StoreItemMetadata = {
    id: 'chromadb',
    name: 'ChromaDB',
    icon: 'store/icons/chromadb.svg',
    shortDescription: 'Vector Database for AI Applications',
    description: `ChromaDB is an open-source embedding database that makes it easy to store 
        and query embeddings for AI applications. Perfect for semantic search, 
        recommendations, and more.`,
    tags: ['Vector Database', 'AI/ML', 'Embeddings'],
    category: 'Database',
    version: '1.0.0',
    author: 'Agent UI',
    links: {
        documentation: 'https://docs.trychroma.com/',
        github: 'https://github.com/chroma-core/chroma'
    }
};

export default chromadbMetadata; 