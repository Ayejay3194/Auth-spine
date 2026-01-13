import { BusinessSpine } from './business-spine.js';
import { Plugin } from './types.js';
import { Logger } from '../utils/logger.js';

export class PluginManager {
  private logger: Logger;

  constructor(private spine: BusinessSpine) {
    this.logger = new Logger({ level: 'info', format: 'simple' });
  }

  async installPlugin(plugin: Plugin): Promise<void> {
    this.logger.info(`Installing plugin: ${plugin.name} v${plugin.version}`);
    
    try {
      // Check dependencies
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.isDependencySatisfied(dep)) {
            throw new Error(`Plugin dependency not satisfied: ${dep}`);
          }
        }
      }

      // Install the plugin
      await plugin.install(this.spine);
      
      this.logger.info(`Plugin installed successfully: ${plugin.name}`);
    } catch (error) {
      this.logger.error(`Failed to install plugin: ${plugin.name}`, error);
      throw error;
    }
  }

  async uninstallPlugin(name: string): Promise<void> {
    this.logger.info(`Uninstalling plugin: ${name}`);
    
    const plugins = this.spine.getPlugins();
    const plugin = plugins.find(p => p.name === name);
    
    if (!plugin) {
      throw new Error(`Plugin not found: ${name}`);
    }

    try {
      if (plugin.uninstall) {
        await plugin.uninstall(this.spine);
      }
      
      this.logger.info(`Plugin uninstalled successfully: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to uninstall plugin: ${name}`, error);
      throw error;
    }
  }

  private isDependencySatisfied(dependency: string): boolean {
    // Check if dependency is a spine
    const spines = this.spine.getSpines();
    if (spines.find(s => s.name === dependency)) {
      return true;
    }

    // Check if dependency is another plugin
    const plugins = this.spine.getPlugins();
    if (plugins.find(p => p.name === dependency)) {
      return true;
    }

    return false;
  }

  listPlugins(): Array<{ name: string; version: string; description: string }> {
    return this.spine.getPlugins().map(p => ({
      name: p.name,
      version: p.version,
      description: p.description
    }));
  }

  getPluginInfo(name: string): { name: string; version: string; description: string; dependencies?: string[] } | null {
    const plugin = this.spine.getPlugins().find(p => p.name === name);
    if (!plugin) {
      return null;
    }

    return {
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      dependencies: plugin.dependencies
    };
  }
}
