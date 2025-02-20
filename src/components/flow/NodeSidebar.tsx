import React from 'react';

const nodeCategories = {
  'Agent': [
    { type: 'agentConfig', label: 'Agent Config' },
    { type: 'storeMemory', label: 'Store Memory' },
    { type: 'queryMemory', label: 'Query Memory' },
  ],
  'ChromaDB': [
    { type: 'createCollection', label: 'Create Collection' },
    { type: 'testCollection', label: 'Test Collection' },
  ],
  'Models': [
    { type: 'ollamaModel', label: 'Ollama Model' },
  ],
};

export function NodeSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, nodeLabel: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label: nodeLabel }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-background border-l border-border/50 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Node Types</h2>
      <div className="space-y-6">
        {Object.entries(nodeCategories).map(([category, nodes]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-foreground/70 mb-2">{category}</h3>
            <div className="space-y-2">
              {nodes.map((node) => (
                <div
                  key={node.type}
                  className="bg-card hover:bg-accent p-3 rounded-lg cursor-move border border-border/50 transition-colors"
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type, node.label)}
                >
                  {node.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 