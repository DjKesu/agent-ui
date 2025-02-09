import React, { useState } from 'react';
import { Search, Plus, Globe, Database, MessageSquare, FolderPlus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      icon: <FolderPlus className="w-4 h-4" />,
      label: "Create Knowledge Base",
      description: "Document store for your data",
      onClick: () => navigate('/knowledge-bases'),
    },
    {
      icon: <MessageSquare className="w-4 h-4" />,
      label: "Create Agent",
      description: "Build and configure a new AI agent",
      onClick: () => console.log("Create Agent clicked"),
    },
    {
      icon: <Globe className="w-4 h-4" />,
      label: "Browse Store",
      description: "Explore available plugins and tools",
      onClick: () => navigate('/store'),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative px-4">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40rem] left-1/2 transform -translate-x-1/2 w-[80rem] h-[80rem] opacity-30">
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-primary/5 to-transparent" />
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 z-10">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-medium tracking-tight text-foreground/90 mb-3">
            What can I help with?
          </h1>
          <p className="text-lg text-foreground/70">
            Create, manage, and deploy AI agents for any task
          </p>
        </div>

        {/* Search Bar */}
        <div className={cn(
          "w-full relative group transition-all duration-300",
          isFocused ? "scale-[1.02]" : ""
        )}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-xl group-hover:opacity-100 opacity-0 transition-opacity" />
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search or describe what you want to do..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full pl-12 pr-4 py-4 bg-card/80 backdrop-blur-xl rounded-2xl
                       text-foreground placeholder:text-foreground/40 text-lg
                       border border-border/50 hover:border-border/80
                       focus:outline-none focus:ring-2 focus:ring-primary/30
                       transition-all duration-300"
            />
            <Search className="absolute left-4 w-5 h-5 text-foreground/50" />
            <kbd className="absolute right-4 px-2 py-1 text-xs font-medium text-foreground/40 bg-background/50 rounded border border-border/50">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="glass-card flex flex-col items-center p-6 hover:scale-[1.01] transition-all duration-200"
            >
              <div className="p-3 rounded-lg bg-primary/5 text-primary mb-4 
                           group-hover:scale-105 group-hover:bg-primary/10 transition-all duration-200
                           ring-1 ring-primary/10 hover:ring-primary/20">
                {action.icon}
              </div>
              <h3 className="font-medium text-foreground/90 mb-1">{action.label}</h3>
              <p className="text-sm text-foreground/60">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 