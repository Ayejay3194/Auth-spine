import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { BusinessSpine } from '../core/business-spine.js';
import { AssistantContext, Role } from '../core/types.js';
import { Logger } from '../utils/logger.js';

export class ApiServer {
  private app: express.Application;
  private spine: BusinessSpine;
  private logger: Logger;

  constructor(spine: BusinessSpine) {
    this.spine = spine;
    this.logger = new Logger({ level: 'info', format: 'json' });
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    const config = this.spine.getConfig();
    
    this.app.use(helmet());
    this.app.use(cors({
      origin: config.api.corsOrigins,
      credentials: true
    }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      this.logger.info('API Request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Assistant endpoint
    this.app.post('/assistant/chat', async (req, res) => {
      try {
        const { message, context } = req.body;
        
        if (!message || !context) {
          return res.status(400).json({ 
            error: 'Missing required fields: message, context' 
          });
        }

        const ctx: AssistantContext = {
          actor: context.actor,
          tenantId: context.tenantId || this.spine.getConfig().tenantId,
          nowISO: context.nowISO || new Date().toISOString(),
          locale: context.locale,
          timezone: context.timezone,
          channel: context.channel || 'api'
        };

        const result = await this.spine.processRequest(message, ctx);
        
        res.json({
          success: true,
          result
        });
      } catch (error) {
        this.logger.error('Chat endpoint error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // Intent detection
    this.app.post('/assistant/intent', async (req, res) => {
      try {
        const { message, context } = req.body;
        
        if (!message || !context) {
          return res.status(400).json({ 
            error: 'Missing required fields: message, context' 
          });
        }

        const ctx: AssistantContext = {
          actor: context.actor,
          tenantId: context.tenantId || this.spine.getConfig().tenantId,
          nowISO: context.nowISO || new Date().toISOString(),
          locale: context.locale,
          timezone: context.timezone,
          channel: context.channel || 'api'
        };

        const intents = this.spine.detectIntents(message, ctx);
        
        res.json({
          success: true,
          intents
        });
      } catch (error) {
        this.logger.error('Intent detection error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // Smart suggestions
    this.app.post('/assistant/suggestions', async (req, res) => {
      try {
        const { context } = req.body;
        
        if (!context) {
          return res.status(400).json({ 
            error: 'Missing required field: context' 
          });
        }

        const ctx: AssistantContext = {
          actor: context.actor,
          tenantId: context.tenantId || this.spine.getConfig().tenantId,
          nowISO: context.nowISO || new Date().toISOString(),
          locale: context.locale,
          timezone: context.timezone,
          channel: context.channel || 'api'
        };

        const suggestions = await this.spine.getSmartSuggestions(ctx);
        
        res.json({
          success: true,
          suggestions
        });
      } catch (error) {
        this.logger.error('Suggestions error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // System information
    this.app.get('/system/info', (req, res) => {
      const config = this.spine.getConfig();
      const spines = this.spine.getSpines();
      const engines = this.spine.getEngines();
      const plugins = this.spine.getPlugins();

      res.json({
        success: true,
        data: {
          tenantId: config.tenantId,
          modules: config.modules,
          assistant: config.assistant,
          spines: spines.map(s => ({ name: s.name, version: s.version, description: s.description })),
          engines: engines.map(e => ({ name: e.name, version: e.version })),
          plugins: plugins.map(p => ({ name: p.name, version: p.version, description: p.description }))
        }
      });
    });

    // Plugin management
    this.app.get('/system/plugins', (req, res) => {
      const plugins = this.spine.getPlugins();
      res.json({
        success: true,
        plugins: plugins.map(p => ({
          name: p.name,
          version: p.version,
          description: p.description,
          dependencies: p.dependencies
        }))
      });
    });

    // Error handling
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.logger.error('Unhandled error', err);
      res.status(500).json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.path
      });
    });
  }

  async start(): Promise<void> {
    const config = this.spine.getConfig();
    
    return new Promise((resolve, reject) => {
      const server = this.app.listen(config.api.port, (err?: Error) => {
        if (err) {
          reject(err);
        } else {
          this.logger.info(`API Server started on port ${config.api.port}`);
          resolve();
        }
      });

      // Handle graceful shutdown
      process.on('SIGTERM', () => {
        this.logger.info('SIGTERM received, shutting down gracefully');
        server.close(() => {
          this.logger.info('API Server stopped');
        });
      });
    });
  }

  getApp(): express.Application {
    return this.app;
  }
}
