import { BusinessSpine } from './core/business-spine.js';
import { ApiServer } from './api/server.js';
import { BusinessSpineConfig } from './core/types.js';
// Simple inline engines for demo
const demoEngines = {
  predictiveScheduling: {
    name: 'predictive_scheduling',
    version: '1.0.0',
    run: async (ctx: any) => []
  },
  clientBehavior: {
    name: 'client_behavior', 
    version: '1.0.0',
    run: async (ctx: any) => []
  }
};
import { Logger } from './utils/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DEFAULT_CONFIG: BusinessSpineConfig = {
  tenantId: process.env.TENANT_ID || 'default-tenant',
  modules: [
    { name: 'booking', enabled: true },
    { name: 'crm', enabled: true },
    { name: 'payments', enabled: true },
    { name: 'marketing', enabled: true },
    { name: 'analytics', enabled: true },
    { name: 'admin_security', enabled: true }
  ],
  assistant: {
    enabled: true,
    engines: ['predictive_scheduling', 'client_behavior']
  },
  api: {
    port: parseInt(process.env.PORT || '3000'),
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },
  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
    format: (process.env.LOG_FORMAT as any) || 'json'
  }
};

async function createBusinessSpine(config?: Partial<BusinessSpineConfig>): Promise<BusinessSpine> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const spine = new BusinessSpine(finalConfig);

  // Register smart engines
  spine.registerEngine(demoEngines.predictiveScheduling);
  spine.registerEngine(demoEngines.clientBehavior);

  await spine.initialize();
  return spine;
}

async function startServer(spine: BusinessSpine): Promise<ApiServer> {
  const server = new ApiServer(spine);
  await server.start();
  return server;
}

// Main function for standalone usage
async function main(): Promise<void> {
  try {
    const logger = new Logger(DEFAULT_CONFIG.logging);
    logger.info('Starting Business Spine...');

    const spine = await createBusinessSpine();
    const server = await startServer(spine);

    logger.info('Business Spine started successfully');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down Business Spine...');
      await spine.shutdown();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start Business Spine:', error);
    process.exit(1);
  }
}

// Export for programmatic usage
export { BusinessSpine, ApiServer, createBusinessSpine, startServer };
export type { BusinessSpineConfig };

// Run if this is the main module
if (require.main === module) {
  main();
}
