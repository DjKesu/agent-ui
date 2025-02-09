import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { PluginMetadata } from '../../services/plugins.service';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { ChangeEvent, KeyboardEvent } from 'react';
import { Textarea } from '../ui/textarea';

const pluginFormSchema = z.object({
    id: z.string().min(3).max(50),
    name: z.string().min(3).max(50),
    shortDescription: z.string().max(100).optional(),
    description: z.string().min(10).max(500),
    author: z.string().min(2).max(50),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    category: z.enum(['llm', 'rag', 'agents', 'workflows', 'tools']),
    tags: z.array(z.string()),
    links: z.object({
        documentation: z.string().url().optional(),
        github: z.string().url().optional(),
        website: z.string().url().optional(),
    }),
    installConfig: z.object({
        type: z.enum(['python', 'npm', 'custom']),
        dependencies: z.array(z.string()).optional(),
        setupCommands: z.array(z.string()).optional(),
        requiresRestart: z.boolean().default(false),
    }),
});

type PluginFormValues = z.infer<typeof pluginFormSchema>;

interface SubmitPluginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SubmitPluginDialog({ open, onOpenChange }: SubmitPluginDialogProps) {
    const form = useForm<PluginFormValues>({
        resolver: zodResolver(pluginFormSchema),
        defaultValues: {
            tags: [],
            links: {},
            installConfig: {
                type: 'python',
                dependencies: [],
                setupCommands: [],
                requiresRestart: false,
            },
        },
    });

    const installType = form.watch('installConfig.type');

    async function onSubmit(data: PluginFormValues) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/plugins/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to submit plugin');
            }

            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error('Error submitting plugin:', error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Submit a Plugin</DialogTitle>
                    <DialogDescription>
                        Fill out the form below to submit your plugin to the store.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Plugin ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="my-awesome-plugin" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            A unique identifier for your plugin (lowercase, dashes allowed)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="My Awesome Plugin" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="shortDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="A brief one-line description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Detailed description of your plugin's functionality"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="llm">LLM Models</SelectItem>
                                                <SelectItem value="rag">RAG & Vector Stores</SelectItem>
                                                <SelectItem value="agents">Agents</SelectItem>
                                                <SelectItem value="workflows">Workflows</SelectItem>
                                                <SelectItem value="tools">Tools & Utilities</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tags Field */}
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags</FormLabel>
                                        <FormControl>
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap gap-2">
                                                    {field.value.map((tag, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="secondary"
                                                            className="px-2 py-1 text-sm flex items-center gap-1"
                                                        >
                                                            {tag}
                                                            <X
                                                                className="w-3 h-3 cursor-pointer"
                                                                onClick={() => {
                                                                    const newTags = [...field.value];
                                                                    newTags.splice(index, 1);
                                                                    field.onChange(newTags);
                                                                }}
                                                            />
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <Input
                                                    placeholder="Type a tag and press Enter"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const input = e.currentTarget;
                                                            const value = input.value.trim();
                                                            if (value && !field.value.includes(value)) {
                                                                field.onChange([...field.value, value]);
                                                                input.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Add tags to help users find your plugin
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Links Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Links</h3>

                                <FormField
                                    control={form.control}
                                    name="links.documentation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Documentation URL</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="https://docs.example.com" 
                                                    {...field} 
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="links.github"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GitHub Repository</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="https://github.com/username/repo" 
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="links.website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="https://example.com" 
                                                    {...field}
                                                    value={field.value || ''}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Installation Configuration */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Installation Configuration</h3>
                            
                            <FormField
                                control={form.control}
                                name="installConfig.type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Installation Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select installation type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="python">Python Package</SelectItem>
                                                <SelectItem value="npm">NPM Package</SelectItem>
                                                <SelectItem value="custom">Custom Installation</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Dependencies Field (for Python and NPM) */}
                            {(installType === 'python' || installType === 'npm') && (
                                <FormField
                                    control={form.control}
                                    name="installConfig.dependencies"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dependencies</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={installType === 'python' 
                                                        ? "One package per line (e.g.:\ntransformers>=4.0.0\ntorch>=1.8.0)"
                                                        : "One package per line (e.g.:\n@openai/api@^4.0.0\naxios@^1.0.0)"
                                                    }
                                                    className="min-h-[100px] font-mono text-sm"
                                                    value={field.value?.join('\n')}
                                                    onChange={(e) => {
                                                        const deps = e.target.value
                                                            .split('\n')
                                                            .map(dep => dep.trim())
                                                            .filter(dep => dep);
                                                        field.onChange(deps);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                List your {installType === 'python' ? 'pip' : 'npm'} dependencies, one per line
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Setup Commands Field (for custom installation) */}
                            {installType === 'custom' && (
                                <FormField
                                    control={form.control}
                                    name="installConfig.setupCommands"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Setup Commands</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="One command per line (e.g.:\ngit clone https://github.com/example/repo\ncd repo && make install)"
                                                    className="min-h-[100px] font-mono text-sm"
                                                    value={field.value?.join('\n')}
                                                    onChange={(e) => {
                                                        const commands = e.target.value
                                                            .split('\n')
                                                            .map(cmd => cmd.trim())
                                                            .filter(cmd => cmd);
                                                        field.onChange(commands);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                List the commands needed to install your plugin, one per line
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="installConfig.requiresRestart"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Requires Restart</FormLabel>
                                            <FormDescription>
                                                Does the application need to restart after installation?
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Submit Plugin</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 