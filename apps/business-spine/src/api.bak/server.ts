import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { BusinessSpine } from '../core/business-spine.js';
import { AssistantContext, Role } from '../core/types.js';
import { Logger } from '../utils/logger.js';
import { authMiddleware, optionalAuthMiddleware, AuthenticatedRequest } from './auth-middleware.js';

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

    // Health check endpoint (no auth required)
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });
  }

  private setupRoutes(): void {
    // Protected API routes - require authentication
    this.app.use('/api/business', authMiddleware);
    this.app.use('/assistant', optionalAuthMiddleware);
    this.app.use('/system', optionalAuthMiddleware);

    // Business initialization endpoint
    this.app.post('/api/business/init', (req: AuthenticatedRequest, res) => {
      try {
        const { userId, timestamp } = req.body;
        
        this.logger.info('Business Spine initialized', {
          userId: req.userId,
          tenantId: req.tenantId,
          timestamp
        });

        res.json({
          success: true,
          tenantId: req.tenantId,
          modules: this.spine.getConfig().modules.map(m => m.name),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.logger.error('Initialization error', error);
        res.status(500).json({ error: 'Initialization failed' });
      }
    });

    // Assistant endpoint
    this.app.post('/assistant/chat', async (req: AuthenticatedRequest, res) => {
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

    // Enhanced chat with LLM and teacher mode
    this.app.post('/assistant/enhanced-chat', async (req, res) => {
      try {
        const { message, context, explain = false, useLLM = null } = req.body;
        
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

        // Override LLM setting if specified
        if (useLLM !== null) {
          this.spine.setLLMEnabled(useLLM);
        }

        const result = await this.spine.processRequest(message, ctx, { explain });
        
        res.json({
          success: true,
          result,
          llmUsed: this.spine.isLLMEnabled(),
          teacherMode: this.spine.isTeacherModeEnabled()
        });
      } catch (error) {
        this.logger.error('Enhanced chat endpoint error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // Teacher explanation endpoint
    this.app.post('/teacher/explain', async (req, res) => {
      try {
        const { type, operation, intent, suggestion, context, result, concept, userLevel = 'intermediate' } = req.body;
        
        if (!type) {
          return res.status(400).json({ 
            error: 'Missing required field: type' 
          });
        }

        const teacherService = this.spine.getTeacherService();
        if (!teacherService) {
          return res.status(503).json({ 
            error: 'Teacher service not available' 
          });
        }

        const teacherRequest = {
          type,
          operation,
          intent,
          suggestion,
          context,
          result,
          concept,
          userLevel
        };

        const teacherResponse = await teacherService.teach(teacherRequest);
        
        res.json({
          success: teacherResponse.success,
          explanation: teacherResponse.explanation,
          error: teacherResponse.error,
          metadata: teacherResponse.metadata
        });
      } catch (error) {
        this.logger.error('Teacher explanation error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // LLM configuration endpoint
    this.app.post('/llm/configure', async (req, res) => {
      try {
        const { provider, apiKey, model, maxTokens, temperature, baseUrl, timeout } = req.body;
        
        if (!provider) {
          return res.status(400).json({ 
            error: 'Missing required field: provider' 
          });
        }

        const llmConfig = {
          provider,
          apiKey,
          model,
          maxTokens,
          temperature,
          baseUrl,
          timeout
        };

        const success = await this.spine.configureLLM(llmConfig);
        
        if (success) {
          res.json({
            success: true,
            message: `LLM configured with ${provider} provider`,
            config: {
              provider,
              model,
              maxTokens,
              temperature
            }
          });
        } else {
          res.status(400).json({
            success: false,
            error: 'Failed to configure LLM'
          });
        }
      } catch (error) {
        this.logger.error('LLM configuration error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // LLM status endpoint
    this.app.get('/llm/status', async (req, res) => {
      try {
        const llmService = this.spine.getLLMService();
        const status = {
          configured: !!llmService,
          available: llmService ? await llmService.isAvailable() : false,
          provider: llmService ? await llmService.getProvider() : null,
          model: llmService ? await llmService.getModel() : null,
          fallbackEnabled: this.spine.isFallbackEnabled()
        };
        
        res.json({
          success: true,
          status
        });
      } catch (error) {
        this.logger.error('LLM status error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // Switch between LLM and pattern-based processing
    this.app.post('/llm/switch', async (req, res) => {
      try {
        const { mode } = req.body;
        
        if (!mode || !['llm', 'patterns', 'auto'].includes(mode)) {
          return res.status(400).json({ 
            error: 'Invalid mode. Must be: llm, patterns, or auto' 
          });
        }

        await this.spine.switchProcessingMode(mode);
        
        res.json({
          success: true,
          message: `Switched to ${mode} processing mode`,
          currentMode: mode
        });
      } catch (error) {
        this.logger.error('LLM switch error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // Toggle teacher mode
    this.app.post('/teacher/toggle', async (req, res) => {
      try {
        const { enabled } = req.body;
        
        if (typeof enabled !== 'boolean') {
          return res.status(400).json({ 
            error: 'enabled must be a boolean' 
          });
        }

        this.spine.setTeacherMode(enabled);
        
        res.json({
          success: true,
          message: `Teacher mode ${enabled ? 'enabled' : 'disabled'}`,
          teacherMode: enabled
        });
      } catch (error) {
        this.logger.error('Teacher toggle error', error);
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
