import { Plugin } from '../../core/types.js';
import { Logger } from '../../utils/logger.js';

const logger = new Logger({ level: 'info', format: 'simple' });

export const examplePlugin: Plugin = {
  name: 'example-plugin',
  version: '1.0.0',
  description: 'Example plugin demonstrating the plugin system',
  dependencies: [],

  async install(spine: any): Promise<void> {
    logger.info('Installing example plugin...');

    // Register a custom tool
    spine.registerTool('example_hello', async ({ ctx, input }: any) => {
      const name = input.name || 'World';
      return {
        ok: true,
        data: { message: `Hello, ${name}!` }
      };
    });

    logger.info('Example plugin installed successfully');
  },

  async uninstall(spine: any): Promise<void> {
    logger.info('Uninstalling example plugin...');
    logger.info('Example plugin uninstalled');
  }
};

export default examplePlugin;
