import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function setup() {
    const persistentPath = path.join(process.cwd(), 'data', 'chromadb');

    // Ensure the ChromaDB data directory exists
    if (!fs.existsSync(persistentPath)) {
        console.log('Creating ChromaDB data directory at:', persistentPath);
        fs.mkdirSync(persistentPath, { recursive: true });
    }

    // Initialize ChromaDB
    try {
        const pythonScript = path.join(process.cwd(), 'scripts', 'start-chromadb.py');
        const { stdout, stderr } = await execAsync(`python ${pythonScript}`);
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
    } catch (error: any) {
        console.error('Failed to initialize ChromaDB:', error.message);
        process.exit(1);
    }
}

setup(); 