import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CreateCollectionNode, TestCollectionNode } from './nodes/ChromaDBNodes';

const nodeTypes = {
  createCollection: CreateCollectionNode,
  testCollection: TestCollectionNode,
};

const initialNodes = [
  {
    id: 'create-collection',
    type: 'createCollection',
    data: { label: 'Create Collection' },
    position: { x: 250, y: 25 },
  },
  {
    id: 'test-collection',
    type: 'testCollection',
    data: { label: 'Test Collection' },
    position: { x: 250, y: 200 },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'create-to-test',
    source: 'create-collection',
    target: 'test-collection',
  },
];

const defaultViewport = { x: 0, y: 0, zoom: 0.75 };

export default function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.24))] overflow-hidden">
      {/* Header Section */}
      <div className="px-8 pt-6 pb-4">
        <h1 className="text-4xl font-medium tracking-tight text-foreground/90 mb-2">ChromaDB Workflow</h1>
        <p className="text-lg text-foreground/70 tracking-wide">
          Test and manage your ChromaDB collections
        </p>
      </div>

      <div className="flex-1 px-8">
        <div className="h-[800px] w-full bg-background rounded-xl overflow-hidden border border-border/50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            defaultViewport={defaultViewport}
            minZoom={0.2}
            maxZoom={4}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
} 