import { Logger } from '../utils/logger.js';

const logger = new Logger({ level: 'info', format: 'simple' });

async function launchTeachingServer() {
  logger.info('🎓 Teaching Server Launcher');
  logger.info('Note: The teaching server has been moved to a separate Express-based application');
  logger.info('This file is kept for reference only');
}

export { launchTeachingServer };
