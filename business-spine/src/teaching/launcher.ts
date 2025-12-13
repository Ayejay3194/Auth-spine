import { SandboxTeachingServer } from './sandbox-server.js';
import { Logger } from '../utils/logger.js';

/**
 * TEACHING SERVER LAUNCHER
 * 
 * This launches a completely isolated teaching server that cannot affect the main system.
 * Run this separately from your main business application.
 * 
 * Usage:
 * npm run teaching-server
 * 
 * This server:
 * - Runs on a different port (default 3001)
 * - Has no access to business data
 * - Cannot execute operations
 * - Is completely read-only
 * - Cannot cause system instability
 */

const logger = new Logger({ level: 'info', format: 'simple' });

async function launchTeachingServer() {
  logger.info('🎓 Starting Isolated Teaching Server...');
  logger.info('🔒 This server is READ-ONLY and cannot affect system operations');
  
  // Get LLM config from environment (optional)
  const llmConfig = process.env.OPENAI_API_KEY ? {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7')
  } : process.env.ANTHROPIC_API_KEY ? {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
    maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '1000'),
    temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7')
  } : undefined;

  const port = parseInt(process.env.TEACHING_PORT || '3001');
  
  try {
    const teachingServer = new SandboxTeachingServer(port, llmConfig);
    
    // Start the server
    await teachingServer.start();
    
    logger.info(`✅ Teaching server running safely on port ${port}`);
    logger.info('📚 Available endpoints:');
    logger.info('   POST /teach - General teaching endpoint');
    logger.info('   POST /explain/system - Explain system components');
    logger.info('   POST /explain/intent - Explain intent detection');
    logger.info('   POST /teach/concept - Learn business concepts');
    logger.info('   GET /topics - View available topics');
    logger.info('   GET /safety - Confirm server isolation');
    logger.info('   GET /examples - See usage examples');
    logger.info('');
    logger.info('🔒 SAFETY CONFIRMED:');
    logger.info('   ✅ Read-only operations only');
    logger.info('   ✅ No business data access');
    logger.info('   ✅ No system modifications');
    logger.info('   ✅ Zero impact on main system');
    logger.info('   ✅ Cannot cause instability');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('🛑 Shutting down teaching server...');
      await teachingServer.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('🛑 Shutting down teaching server...');
      await teachingServer.stop();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('❌ Failed to start teaching server', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  launchTeachingServer().catch(error => {
    logger.error('Fatal error starting teaching server', error);
    process.exit(1);
  });
}

export { launchTeachingServer };
