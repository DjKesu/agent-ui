import React from 'react';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Package, 
  ArrowUpRight,
  Loader2,
  BarChart3
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Task {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  plugin: string;
  startTime: string;
  duration?: string;
  error?: string;
}

interface Metric {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    name: 'Process customer feedback using AutoGen agents',
    status: 'running',
    plugin: 'AutoGen Integration',
    startTime: '2024-02-04T10:30:00',
  },
  {
    id: '2',
    name: 'Generate product descriptions',
    status: 'completed',
    plugin: 'LangChain Agents',
    startTime: '2024-02-04T10:00:00',
    duration: '15m 30s',
  },
  {
    id: '3',
    name: 'Update knowledge base',
    status: 'failed',
    plugin: 'ChromaDB Vector Store',
    startTime: '2024-02-04T09:45:00',
    duration: '5m 12s',
  },
  {
    id: '4',
    name: 'Code review using MetaGPT',
    status: 'queued',
    plugin: 'MetaGPT Workflows',
    startTime: '2024-02-04T11:00:00',
  },
];

const METRICS: Metric[] = [
  {
    label: 'Tasks Completed',
    value: 1250,
    change: 12.5,
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
  },
  {
    label: 'Success Rate',
    value: '94.8%',
    change: -2.4,
    icon: <Activity className="w-4 h-4 text-blue-500" />,
  },
  {
    label: 'Active Plugins',
    value: 8,
    change: 33.3,
    icon: <Package className="w-4 h-4 text-purple-500" />,
  },
  {
    label: 'Avg Response Time',
    value: '1.2s',
    change: -15.3,
    icon: <Clock className="w-4 h-4 text-orange-500" />,
  },
];

const PLUGIN_USAGE = [
  { name: 'AutoGen Integration', usage: 85, category: 'agents' },
  { name: 'LangChain Agents', usage: 72, category: 'agents' },
  { name: 'Ollama Models', usage: 64, category: 'llm' },
  { name: 'ChromaDB Vector Store', usage: 45, category: 'rag' },
  { name: 'MetaGPT Workflows', usage: 38, category: 'workflows' },
];

const MetricCard: React.FC<{ metric: Metric }> = ({ metric }) => (
  <div className="bg-card/40 p-6 rounded-xl">
    <div className="flex items-start justify-between">
      <div className="p-2 bg-background/60 rounded-lg">
        {metric.icon}
      </div>
      <span className={cn(
        "text-sm font-medium",
        metric.change > 0 ? "text-success" : "text-error"
      )}>
        {metric.change > 0 ? '+' : ''}{metric.change}%
      </span>
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-bold text-foreground/90">{metric.value}</h3>
      <p className="text-sm text-foreground/60">{metric.label}</p>
    </div>
  </div>
);

const TaskRow: React.FC<{ task: Task }> = ({ task }) => {
  const getStatusIcon = () => {
    switch (task.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-error" />;
      case 'queued':
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border/10 last:border-0">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div>
          <h4 className="font-medium text-foreground/90">{task.name}</h4>
          <p className="text-sm text-foreground/60">
            {task.plugin} • Started {new Date(task.startTime).toLocaleTimeString()}
          </p>
        </div>
      </div>
      <div className="text-sm">
        {task.duration && <span className="text-foreground/60">{task.duration}</span>}
        {task.error && <span className="text-error/90">Error: {task.error}</span>}
      </div>
    </div>
  );
};

const PluginUsageChart: React.FC = () => {
  const maxUsage = Math.max(...PLUGIN_USAGE.map(p => p.usage));
  
  return (
    <div className="flex flex-col h-[300px] p-2">
      <div className="flex-1 flex items-end gap-4">
        {PLUGIN_USAGE.map((plugin, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center">
              <div 
                className="w-full bg-primary/15 rounded-lg transition-all duration-500 ease-out"
                style={{ 
                  height: `${(plugin.usage / maxUsage) * 200}px`,
                }}
              >
                <div 
                  className="w-full h-full bg-primary/20 rounded-lg transform hover:translate-y-1 transition-all"
                  style={{
                    opacity: plugin.usage / maxUsage,
                  }}
                />
              </div>
              <span className="mt-2 text-sm font-medium text-primary">
                {plugin.usage}%
              </span>
            </div>
            <span className="text-xs text-foreground/60 text-center line-clamp-2 h-8">
              {plugin.name}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-foreground/50" />
          <span className="text-sm text-foreground/50">Usage %</span>
        </div>
        <span className="text-xs text-foreground/40">Last 30 days</span>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.24))] overflow-hidden">
      {/* Header Section */}
      <div className="px-8 pt-6 pb-4">
        <h1 className="text-4xl font-medium tracking-tight text-foreground/90 mb-2">Dashboard</h1>
        <p className="text-lg text-foreground/70 tracking-wide">
          Monitor your agent activities and performance
        </p>
      </div>

      <div className="px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {METRICS.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card/40 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border/10 bg-background/40">
              <h2 className="font-medium text-foreground/80">Recent Tasks</h2>
            </div>
            <div>
              {SAMPLE_TASKS.map(task => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </div>

          <div className="bg-card/40 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border/10 bg-background/40">
              <h2 className="font-medium text-foreground/80">Active Plugins</h2>
            </div>
            <div className="p-4">
              <PluginUsageChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 