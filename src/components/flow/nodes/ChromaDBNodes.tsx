import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function CreateCollectionNode({ data }: { data: any }) {
  const [collectionName, setCollectionName] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCreate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/vectordb/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: collectionName }),
      });
      
      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="bg-background border-2 rounded-lg p-4 min-w-[300px]">
      <Handle type="target" position={Position.Top} />
      <div className="space-y-4">
        <h3 className="font-semibold">Create ChromaDB Collection</h3>
        <div className="space-y-2">
          <Label>Collection Name</Label>
          <Input 
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="Enter collection name"
          />
        </div>
        <Button onClick={handleCreate} className="w-full">
          Create Collection
        </Button>
        {status === 'success' && (
          <p className="text-sm text-green-500">Collection created successfully!</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-500">Failed to create collection</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function TestCollectionNode({ data }: { data: any }) {
  const [collectionName, setCollectionName] = useState('');
  const [testText, setTestText] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleTest = async () => {
    try {
      // First add a test document
      const addResponse = await fetch(`${API_URL}/api/vectordb/collections/${collectionName}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: [{
            id: 'test-' + Date.now(),
            text: testText,
            metadata: { source: 'workflow-test' }
          }]
        }),
      });

      if (addResponse.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="bg-background border-2 rounded-lg p-4 min-w-[300px]">
      <Handle type="target" position={Position.Top} />
      <div className="space-y-4">
        <h3 className="font-semibold">Test ChromaDB Collection</h3>
        <div className="space-y-2">
          <Label>Collection Name</Label>
          <Input 
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="Enter collection name"
          />
        </div>
        <div className="space-y-2">
          <Label>Test Text</Label>
          <Input 
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to store"
          />
        </div>
        <Button onClick={handleTest} className="w-full">
          Test Collection
        </Button>
        {status === 'success' && (
          <p className="text-sm text-green-500">Test document added successfully!</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-500">Failed to add test document</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
} 