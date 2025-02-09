import React, { useState } from 'react';
import { Plus, Search, Filter, Network as Api, Code, Terminal, Globe, Wrench } from 'lucide-react';
import AddToolModal from './AddToolModal';
import { cn } from '../../lib/utils';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'api' | 'function' | 'system' | 'web';
  status: 'active' | 'inactive';
}

const SAMPLE_TOOLS: Tool[] = [
  {
    id: '1',
    name: 'OpenAI API',
    description: 'Integration with OpenAI GPT models for text generation and completion',
    category: 'api',
    status: 'active',
  },
  {
    id: '2',
    name: 'File System',
    description: 'Access and manipulate files on the local system',
    category: 'system',
    status: 'active',
  },
  {
    id: '3',
    name: 'Web Scraper',
    description: 'Extract data from web pages',
    category: 'web',
    status: 'inactive',
  },
];

const CategoryIcon = ({ category }: { category: Tool['category'] }) => {
  switch (category) {
    case 'api':
      return <Api className="h-5 w-5" />;
    case 'function':
      return <Code className="h-5 w-5" />;
    case 'system':
      return <Terminal className="h-5 w-5" />;
    case 'web':
      return <Globe className="h-5 w-5" />;
  }
};

const ToolCard: React.FC<{ 
  tool: Tool;
  onStatusToggle: (id: string) => void;
}> = ({ tool, onStatusToggle }) => (
  <div className="flex flex-col p-4 bg-card/40 rounded-xl hover:bg-card/60 transition-colors">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-lg bg-background/60 text-primary">
        <CategoryIcon category={tool.category} />
      </div>
      <div>
        <h3 className="font-medium text-foreground/90">{tool.name}</h3>
        <span className="text-sm text-foreground/60 capitalize">{tool.category} Tool</span>
      </div>
    </div>
    <p className="text-sm text-foreground/70 mb-4">{tool.description}</p>
    <div className="flex items-center justify-between mt-auto">
      <button 
        onClick={() => onStatusToggle(tool.id)}
        className={cn(
          "text-xs px-2 py-1 rounded-full border transition-colors",
          tool.status === 'active' 
            ? "bg-success/10 text-success border-success/20" 
            : "bg-error/10 text-error border-error/20"
        )}
      >
        {tool.status}
      </button>
      <button className="text-sm text-primary hover:text-primary/80 transition-colors">
        Configure
      </button>
    </div>
  </div>
);

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Tool['category'] | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tools, setTools] = useState<Tool[]>(SAMPLE_TOOLS);

  const handleAddTool = (newTool: Omit<Tool, 'id' | 'status'>) => {
    const tool: Tool = {
      ...newTool,
      id: Date.now().toString(),
      status: 'inactive',
    };
    setTools([...tools, tool]);
  };

  const handleStatusToggle = (id: string) => {
    setTools(tools.map(tool => 
      tool.id === id 
        ? { ...tool, status: tool.status === 'active' ? 'inactive' : 'active' }
        : tool
    ));
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.24))] overflow-hidden">
      {/* Header Section */}
      <div className="px-8 pt-6 pb-4">
        <h1 className="text-4xl font-medium tracking-tight text-foreground/90 mb-2">Tools</h1>
        <p className="text-lg text-foreground/70 tracking-wide">
          Manage and configure tools for your agents
        </p>
      </div>

      <div className="px-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              <input
                type="text"
                placeholder="Search tools..."
                className="w-full pl-10 pr-4 py-3 text-base bg-card/80 rounded-xl
                         text-foreground placeholder:text-foreground/40
                         focus:outline-none focus:ring-2 focus:ring-primary/30
                         border border-border/50 hover:border-border/80
                         transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="ml-4 flex items-center gap-2 px-4 py-2 bg-primary/15 text-primary 
                       hover:bg-primary/20 rounded-xl border border-primary/20 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Tool
            </button>
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
            <select
              className="pl-10 pr-8 py-2 bg-card/80 rounded-xl border border-border/50
                       hover:border-border/80 text-foreground appearance-none transition-colors"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Tool['category'] | 'all')}
            >
              <option value="all">All Categories</option>
              <option value="api">API</option>
              <option value="function">Function</option>
              <option value="system">System</option>
              <option value="web">Web</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {filteredTools.map(tool => (
            <ToolCard 
              key={tool.id} 
              tool={tool}
              onStatusToggle={handleStatusToggle}
            />
          ))}
        </div>
      </div>

      <AddToolModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTool}
      />
    </div>
  );
} 
