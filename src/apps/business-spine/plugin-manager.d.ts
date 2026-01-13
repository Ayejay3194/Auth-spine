import { BusinessSpine } from './business-spine.js';
import { Plugin } from './types.js';
export declare class PluginManager {
    private spine;
    private logger;
    constructor(spine: BusinessSpine);
    installPlugin(plugin: Plugin): Promise<void>;
    uninstallPlugin(name: string): Promise<void>;
    private isDependencySatisfied;
    listPlugins(): Array<{
        name: string;
        version: string;
        description: string;
    }>;
    getPluginInfo(name: string): {
        name: string;
        version: string;
        description: string;
        dependencies?: string[];
    } | null;
}
//# sourceMappingURL=plugin-manager.d.ts.map