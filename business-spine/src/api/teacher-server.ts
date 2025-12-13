import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { TeacherBusinessSpine } from '../core/teacher-business-spine.js';
import { AssistantContext, Role } from '../core/types.js';
import { Logger } from '../utils/logger.js';
import { authMiddleware, optionalAuthMiddleware, AuthenticatedRequest } from './auth-middleware.js';

export class TeacherApiServer {
  private app: express.Application;
  private spine: TeacherBusinessSpine;
  private logger: Logger;

  constructor(spine: TeacherBusinessSpine) {
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
      this.logger.info('Teacher API Request', {
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
        version: '1.0.0',
        mode: 'teacher-only'
      });
    });
  }

  private setupRoutes(): void {
    // Core business endpoints (original behavior preserved)
    this.app.post('/assistant/chat', async (req, res) => {
      try {
        const { message, context, explain = false } = req.body;
        
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

        // Use teacher spine for processing (preserves original logic)
        const result = await this.spine.processRequest(message, ctx, { explain });
        
        res.json({
          success: true,
          result,
          teacherEnabled: this.spine.isTeacherEnabled(),
          explanation: result.explanation || undefined
        });
      } catch (error) {
        this.logger.error('Chat endpoint error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // Intent detection (original behavior)
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

    // Smart suggestions (original behavior)
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

    // === TEACHER-ONLY ENDPOINTS ===
    // These endpoints only provide explanations, don't affect core operations

    // Explain operation
    this.app.post('/teacher/explain-operation', async (req, res) => {
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

        const explanation = await this.spine.explainOperation(message, ctx);
        
        res.json({
          success: true,
          explanation,
          teacherEnabled: this.spine.isTeacherEnabled()
        });
      } catch (error) {
        this.logger.error('Operation explanation error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // Explain intent
    this.app.post('/teacher/explain-intent', async (req, res) => {
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

        const explanation = await this.spine.explainIntent(message, ctx);
        
        res.json({
          success: true,
          explanation,
          teacherEnabled: this.spine.isTeacherEnabled()
        });
      } catch (error) {
        this.logger.error('Intent explanation error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // Explain suggestion
    this.app.post('/teacher/explain-suggestion', async (req, res) => {
      try {
        const { suggestion, context } = req.body;
        
        if (!suggestion || !context) {
          return res.status(400).json({ 
            error: 'Missing required fields: suggestion, context' 
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

        const explanation = await this.spine.explainSuggestion(suggestion, ctx);
        
        res.json({
          success: true,
          explanation,
          teacherEnabled: this.spine.isTeacherEnabled()
        });
      } catch (error) {
        this.logger.error('Suggestion explanation error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // Teach concept
    this.app.post('/teacher/teach-concept', async (req, res) => {
      try {
        const { concept, userLevel = 'intermediate' } = req.body;
        
        if (!concept) {
          return res.status(400).json({ 
            error: 'Missing required field: concept' 
          });
        }

        const explanation = await this.spine.teachConcept(concept, userLevel);
        
        res.json({
          success: true,
          explanation,
          teacherEnabled: this.spine.isTeacherEnabled()
        });
      } catch (error) {
        this.logger.error('Concept teaching error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // Configure teacher LLM
    this.app.post('/teacher/configure', async (req, res) => {
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

        const success = await this.spine.configureTeacher(llmConfig);
        
        if (success) {
          res.json({
            success: true,
            message: `Teacher configured with ${provider} LLM`,
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
            error: 'Failed to configure teacher LLM'
          });
        }
      } catch (error) {
        this.logger.error('Teacher configuration error', error);
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

    // Teacher status
    this.app.get('/teacher/status', async (req, res) => {
      try {
        const status = {
          enabled: this.spine.isTeacherEnabled(),
          available: this.spine.isTeacherAvailable(),
          configured: !!this.spine.getTeacherService()
        };
        
        res.json({
          success: true,
          status
        });
      } catch (error) {
        this.logger.error('Teacher status error', error);
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // System information (updated for teacher mode)
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
          teacher: {
            enabled: this.spine.isTeacherEnabled(),
            available: this.spine.isTeacherAvailable(),
            configured: !!this.spine.getTeacherService()
          },
          spines: spines.map(s => ({ name: s.name, version: s.version, description: s.description })),
          engines: engines.map(e => ({ name: e.name, version: e.version })),
          plugins: plugins.map(p => ({ name: p.name, version: p.version, description: p.description })),
          mode: 'teacher-only',
          coreSystem: 'rule-based'
        }
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ 
        error: 'Endpoint not found',
        availableEndpoints: [
          'POST /assistant/chat',
          'POST /assistant/intent', 
          'POST /assistant/suggestions',
          'POST /teacher/explain-operation',
          'POST /teacher/explain-intent',
          'POST /teacher/explain-suggestion',
          'POST /teacher/teach-concept',
          'POST /teacher/configure',
          'POST /teacher/toggle',
          'GET /teacher/status',
          'GET /system/info',
          'GET /health'
        ]
      });
    });

    // Error handler
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.logger.error('Unhandled error', err);
      res.status(500).json({ 
        error: 'Internal server error' 
      });
    });
  }

  start(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.app.listen(port, () => {
          this.logger.info(`Teacher API Server started on port ${port}`);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  getApp(): express.Application {
    return this.app;
  }
}
