import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CreateCollectionNode, TestCollectionNode } from './nodes/ChromaDBNodes';
import { AgentConfigNode, StoreMemoryNode, QueryMemoryNode } from './nodes/AgentNodes';
import { OllamaModelNode } from './nodes/OllamaNodes';
import { NodeSidebar } from './NodeSidebar';

const nodeTypes = {
  agentConfig: AgentConfigNode,
  storeMemory: StoreMemoryNode,
  queryMemory: QueryMemoryNode,
  ollamaModel: OllamaModelNode,
  createCollection: CreateCollectionNode,
  testCollection: TestCollectionNode,
};

const initialNodes = [
  {
    id: 'create-collection',
    type: 'createCollection',
    data: { label: 'Create Collection' },
    position: { x: 250, y: 25 },
    size: { width: 50, height: 50 },
  },
  {
    id: 'test-collection',
    type: 'testCollection',
    data: { label: 'Test Collection' },
    position: { x: 250, y: 150 },
    size: { width: 50, height: 50 }
  },
];

const initialEdges: Edge[] = [
  {
    id: 'collection-test',
    source: 'create-collection',
    target: 'test-collection',
  },
];

const defaultViewport = { x: 0, y: 0, zoom: 0.2 };

export default function FlowBuilder() {
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  const [ollamaConfig, setOllamaConfig] = useState<{ model: string; useInContext: boolean } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      agentId: currentAgentId,
      ollamaConfig,
      onAgentCreated: (id: string) => {
        setCurrentAgentId(id);
        // Update all nodes with the new agent ID
        setNodes(nds => nds.map(n => ({
          ...n,
          data: { ...n.data, agentId: id }
        })));
      },
      onChange: (config: any) => {
        if (node.type === 'ollamaModel') {
          setOllamaConfig(config);
          // Update all nodes with the new Ollama config
          setNodes(nds => nds.map(n => ({
            ...n,
            data: { ...n.data, ollamaConfig: config }
          })));
        }
      }
    }
  })));
  
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const data = event.dataTransfer.getData('application/reactflow');
      
      try {
        const { type, label } = JSON.parse(data);
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode = {
          id: `${type}-${Date.now()}`,
          type,
          position,
          data: { 
            label,
            agentId: currentAgentId,
            ollamaConfig,
            onAgentCreated: (id: string) => {
              setCurrentAgentId(id);
              setNodes(nds => nds.map(n => ({
                ...n,
                data: { ...n.data, agentId: id }
              })));
            },
            onChange: (config: any) => {
              if (type === 'ollamaModel') {
                setOllamaConfig(config);
                setNodes(nds => nds.map(n => ({
                  ...n,
                  data: { ...n.data, ollamaConfig: config }
                })));
              }
            }
          },
        };

        setNodes((nds) => nds.concat(newNode));
      } catch (error) {
        console.error('Error adding new node:', error);
      }
    },
    [reactFlowInstance, currentAgentId, ollamaConfig, setNodes],
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.24))] overflow-hidden">
      {/* Header Section */}
      <div className="px-8 pt-6 pb-4">
        <h1 className="text-4xl font-medium tracking-tight text-foreground/90 mb-2">Agent Memory Workflow</h1>
        <p className="text-lg text-foreground/70 tracking-wide">
          Configure your agent with Ollama models and ChromaDB memory
        </p>
      </div>

      <div className="flex-1 px-8">
        <div className="flex h-[800px] w-full bg-background rounded-xl overflow-hidden border border-border/50">
          <div className="flex-1" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              defaultViewport={defaultViewport}
              onDragOver={onDragOver}
              onDrop={onDrop}
              minZoom={0.2}
              maxZoom={4}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
          <NodeSidebar />
        </div>
      </div>
    </div>
  );
} 