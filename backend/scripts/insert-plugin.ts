import { Command } from 'commander';
import PluginDatabase from '../databases/sqlite/plugins';
import { Plugin } from '../databases/sqlite/plugins';
import inquirer from 'inquirer';

const program = new Command();

program
  .name('insert-plugin')
  .description('CLI tool to insert plugins into the SQLite database');

async function promptForPluginData(): Promise<Omit<Plugin, 'installedAt' | 'updatedAt'>> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Plugin ID:',
      validate: (input) => input.length > 0 || 'ID is required'
    },
    {
      type: 'input',
      name: 'name',
      message: 'Plugin Name:',
      validate: (input) => input.length > 0 || 'Name is required'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Plugin Description:'
    },
    {
      type: 'input',
      name: 'version',
      message: 'Plugin Version:',
      default: '1.0.0',
      validate: (input) => /^\d+\.\d+\.\d+$/.test(input) || 'Version must be in format x.y.z'
    },
    {
      type: 'confirm',
      name: 'isActive',
      message: 'Is the plugin active?',
      default: false
    },
    {
      type: 'input',
      name: 'metadata',
      message: 'Plugin Metadata (as JSON string):',
      default: '{}',
      validate: (input) => {
        try {
          JSON.parse(input);
          return true;
        } catch (e) {
          return 'Must be valid JSON';
        }
      }
    }
  ]);

  return answers;
}

async function main() {
  try {
    const pluginData = await promptForPluginData();
    const db = PluginDatabase.getInstance();
    await db.initialize();
    await db.addPlugin(pluginData);
    console.log('Plugin successfully added to database!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 