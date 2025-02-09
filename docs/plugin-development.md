# Plugin Development Guide

This guide will help you create and submit a plugin for the Agent UI Plugin Store.

## Plugin Structure

A plugin consists of two main parts:

1. Plugin metadata (information about your plugin)

2. Installation configuration (how to install and set up your plugin)

### Plugin Metadata Template

```typescript
{
    id: 'your-plugin-id',          // Unique identifier for your plugin
    name: 'Your Plugin Name',      // Display name
    icon: '/store/icons/your-icon.png', // Path to plugin icon (in public/store/icons)
    shortDescription: 'One-line description',
    description: 'Detailed description of your plugin functionality',
    tags: ['Tag1', 'Tag2'],       // Relevant tags for searching
    category: 'rag',              // One of: 'llm', 'rag', 'agents', 'workflows', 'tools'
    version: '1.0.0',             // Semantic versioning
    author: 'Your Name',
    links: {
        documentation: 'https://docs.example.com',
        github: 'https://github.com/example/plugin',
        website: 'https://example.com'
    },
    installConfig: {
        type: 'python',           // One of: 'python', 'npm', 'custom'
        dependencies: ['package1', 'package2'],  // Required packages
        setupCommands: ['command1', 'command2'], // Optional setup commands
        requiresRestart: false    // Whether app needs restart after install
    }
}
```

## Installation Types

### 1. Python Package
For plugins that require Python packages:
```typescript
installConfig: {
    type: 'python',
    dependencies: ['your-package', 'other-package>=1.0.0'],
    requiresRestart: false
}
```

### 2. NPM Package
For plugins that require Node.js packages:
```typescript
installConfig: {
    type: 'npm',
    dependencies: ['package-name', '@scope/package'],
    requiresRestart: false
}
```

### 3. Custom Installation
For plugins that need custom installation steps:
```typescript
installConfig: {
    type: 'custom',
    setupCommands: [
        'git clone https://github.com/example/repo',
        'cd repo && make install'
    ],
    requiresRestart: true
}
```

## Adding Custom Handlers

For plugins that need special installation or status checking logic, you can add a custom handler to the `PluginsService`:

```typescript
// In src/services/plugins.service.ts
private static pluginHandlers = {
    'your-plugin-id': {
        install: async () => {
            // Custom installation logic
        },
        uninstall: async () => {
            // Custom uninstallation logic
        },
        checkStatus: async () => {
            // Custom status check logic
            return {
                isInstalled: true,
                isActive: true,
                version: '1.0.0'
            };
        }
    }
};
```

## Submitting Your Plugin

1. Prepare your plugin icon:
   - Add your icon to `public/store/icons/`
   - Use PNG format, recommended size 128x128px

2. Submit your plugin metadata:
   ```bash
   curl -X POST http://localhost:3001/api/plugins/submit \
     -H "Content-Type: application/json" \
     -d @your-plugin.json
   ```

## Testing Your Plugin

1. Get the plugin template:
   ```bash
   curl http://localhost:3001/api/plugins/template
   ```

2. Test installation:
   ```bash
   curl -X POST http://localhost:3001/api/plugins/your-plugin-id/install
   ```

3. Check status:
   ```bash
   curl http://localhost:3001/api/plugins/your-plugin-id/status
   ```

4. Test uninstallation:
   ```bash
   curl -X POST http://localhost:3001/api/plugins/your-plugin-id/uninstall
   ```

## Best Practices

1. **Dependencies**: List all required dependencies with version constraints
2. **Error Handling**: Implement proper error handling in custom handlers
3. **Cleanup**: Ensure proper cleanup during uninstallation
4. **Documentation**: Provide clear documentation and examples
5. **Testing**: Test your plugin on a fresh installation

## Example Plugin

Here's a complete example of a plugin that integrates a Python package:

```typescript
{
    id: 'text-summarizer',
    name: 'Text Summarizer',
    icon: '/store/icons/summarizer.png',
    shortDescription: 'AI-powered text summarization',
    description: 'Automatically generate concise summaries of long texts using state-of-the-art language models.',
    tags: ['NLP', 'Summarization', 'AI'],
    category: 'tools',
    version: '1.0.0',
    author: 'AI Tools Inc',
    links: {
        documentation: 'https://github.com/example/text-summarizer/docs',
        github: 'https://github.com/example/text-summarizer'
    },
    installConfig: {
        type: 'python',
        dependencies: [
            'transformers>=4.0.0',
            'torch>=1.8.0',
            'summarizer==1.0.0'
        ],
        requiresRestart: true
    }
}
``` 