import chromadb
from chromadb.config import Settings
import os
import sys

def start_server():
    persistent_dir = os.path.join(os.getcwd(), "data", "chromadb")
    os.makedirs(persistent_dir, exist_ok=True)
    
    print(f"Starting ChromaDB server with persistence at: {persistent_dir}")
    
    settings = Settings(
        chroma_db_impl="duckdb+parquet",
        persist_directory=persistent_dir,
        allow_reset=True,
        is_persistent=True
    )
    
    # Create the client with persistence
    client = chromadb.PersistentClient(path=persistent_dir)
    
    # Test creating a collection
    try:
        collection = client.create_collection(name="test_connection")
        print("Successfully created test collection")
        client.delete_collection(name="test_connection")
        print("Successfully cleaned up test collection")
    except Exception as e:
        print(f"Error testing ChromaDB: {str(e)}")
        sys.exit(1)
    
    print("ChromaDB is ready to use!")

if __name__ == "__main__":
    start_server() 