import React, { useState } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tool: Omit<Tool, 'id' | 'status'>) => void;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'api' | 'function' | 'system' | 'web';
  status: 'active' | 'inactive';
}

export const getStatusBadge = (status: Tool['status']) => {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
      <XCircle className="w-3.5 h-3.5 mr-1" />
      Inactive
    </span>
  );
};

export default function AddToolModal({ isOpen, onClose, onAdd }: AddToolModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'api' as Tool['category'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg">
        <div className="bg-background border rounded-lg shadow-lg">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Add New Tool</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tool Name
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description
              </label>
              <textarea
                required
                className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Category
              </label>
              <select
                required
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Tool['category'] })}
              >
                <option value="api">API</option>
                <option value="function">Function</option>
                <option value="system">System</option>
                <option value="web">Web</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Add Tool
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 