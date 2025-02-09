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

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 25 },
  },
];

const initialEdges: Edge[] = [];

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
        <h1 className="text-4xl font-medium tracking-tight text-foreground/90 mb-2">Workflows</h1>
        <p className="text-lg text-foreground/70 tracking-wide">
          Design and manage your agent workflows visually
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