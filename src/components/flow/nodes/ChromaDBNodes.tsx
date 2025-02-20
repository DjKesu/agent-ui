import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { useToast } from '../../ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function CreateCollectionNode({ data }: { data: any }) {
  const [collectionName, setCollectionName] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!collectionName) {
      toast({
        title: "Error",
        description: "Please enter a collection name",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/vectordb/collections/${collectionName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: { source: 'workflow' } }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setStatus('success');
        toast({
          title: "Success",
          description: `Collection "${collectionName}" created successfully`,
        });
        if (data.onChange) {
          data.onChange(collectionName);
        }
      } else {
        setStatus('error');
        toast({
          title: "Error",
          description: data.error || "Failed to create collection",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setStatus('error');
      toast({
        title: "Error",
        description: error.message || "Failed to create collection",
        variant: "destructive"
      });
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
  const { toast } = useToast();

  const handleTest = async () => {
    if (!collectionName || !testText) {
      toast({
        title: "Error",
        description: "Please enter both collection name and test text",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/vectordb/collections/${collectionName}/documents`, {
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

      const data = await response.json();
      
      if (data.status === 'success') {
        setStatus('success');
        toast({
          title: "Success",
          description: "Test document added successfully",
        });
      } else {
        setStatus('error');
        toast({
          title: "Error",
          description: data.error || "Failed to add test document",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setStatus('error');
      toast({
        title: "Error",
        description: error.message || "Failed to add test document",
        variant: "destructive"
      });
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
          <Textarea 
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to store"
          />
        </div>
        <Button onClick={handleTest} className="w-full">
          Add Test Document
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