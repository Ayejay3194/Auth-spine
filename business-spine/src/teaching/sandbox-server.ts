import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { IsolatedTeacher, TeachingRequest } from './isolated-teacher.js';
import { Logger } from '../utils/logger.js';

/**
 * SANDBOXED TEACHING API SERVER
 * 
 * This server is completely isolated from the main business system.
 * It cannot:
 * - Access business data
 * - Execute operations
 * - Modify system state
 * - Affect main system performance
 * - Cause instability
 * 
 * It can only:
 * - Provide educational content
 * - Explain system concepts
 * - Teach about business automation
 * - Answer questions (read-only)
 */
export class SandboxTeachingServer {
  private app: express.Application;
  private teacher: IsolatedTeacher;
  private logger: Logger;
  private port: number;

  constructor(port: number = 3001, llmConfig?: any) {
    this.port = port;
    this.logger = new Logger({ level: 'info', format: 'json' });
    this.teacher = new IsolatedTeacher(llmConfig);
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    
    this.logger.info(`Sandbox Teaching Server initialized on port ${port}`);
    this.logger.info('This server is READ-ONLY and cannot affect system operations');
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: '*', // More permissive for teaching
      credentials: false // No credentials needed for read-only operations
    }));
    this.app.use(express.json({ limit: '1mb' })); // Smaller limit for teaching
    
    // Request logging
    this.app.use((req, res, next) => {
      this.logger.info('Teaching API Request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      next();
    });

    // Safety headers
    this.app.use((req, res, next) => {
      res.setHeader('X-Teaching-Server', 'true');
      res.setHeader('X-System-Impact', 'none');
      res.setHeader('X-Read-Only', 'true');
      next();
    });
  }

  private setupRoutes(): void {
    // Health check - confirms server is running safely
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        server: 'sandbox-teaching',
        impact: 'none',
        readOnly: true,
        isolated: true
      });
    });

    // System safety information
    this.app.get('/safety', (req, res) => {
      res.json({
        server: 'sandbox-teaching',
        safety: {
          readOnly: true,
          isolated: true,
          noSystemAccess: true,
          noDataModification: true,
          noOperations: true,
          impact: 'none'
        },
        capabilities: [
          'explain_concepts',
          'teach_business_automation',
          'answer_questions',
          'provide_examples'
        ],
        limitations: [
          'cannot_execute_operations',
          'cannot_access_business_data',
          'cannot_modify_system',
          'cannot_affect_performance'
        ]
      });
    });

    // Main teaching endpoint
    this.app.post('/teach', async (req, res) => {
      try {
        const teachingRequest: TeachingRequest = req.body;
        
        // Validate request
        if (!teachingRequest.type || !teachingRequest.topic) {
          return res.status(400).json({ 
            error: 'Missing required fields: type, topic',
            example: {
              type: 'explain_system',
              topic: 'intent_detection',
              userLevel: 'intermediate'
            }
          });
        }

        // Process teaching request (READ-ONLY)
        const response = await this.teacher.teach(teachingRequest);
        
        res.json({
          success: true,
          ...response,
          safety: {
            readOnly: true,
            noSystemImpact: true
          }
        });
      } catch (error: any) {
        this.logger.error('Teaching endpoint error', error);
        res.status(500).json({ 
          error: 'Teaching service error',
          details: error.message,
          safety: {
            readOnly: true,
            noSystemImpact: true
          }
        });
      }
    });

    // Explain system component
    this.app.post('/explain/system', async (req, res) => {
      try {
        const { topic, userLevel = 'intermediate' } = req.body;
        
        if (!topic) {
          return res.status(400).json({ 
            error: 'Missing required field: topic' 
          });
        }

        const response = await this.teacher.teach({
          type: 'explain_system',
          topic,
          userLevel
        });
        
        res.json({
          success: true,
          ...response,
          safety: { readOnly: true }
        });
      } catch (error: any) {
        this.logger.error('System explanation error', error);
        res.status(500).json({ 
          error: 'Explanation failed',
          safety: { readOnly: true }
        });
      }
    });

    // Explain intent detection
    this.app.post('/explain/intent', async (req, res) => {
      try {
        const { intent, context, userLevel = 'intermediate' } = req.body;
        
        if (!intent) {
          return res.status(400).json({ 
            error: 'Missing required field: intent' 
          });
        }

        const response = await this.teacher.teach({
          type: 'explain_intent',
          topic: intent,
          context,
          userLevel
        });
        
        res.json({
          success: true,
          ...response,
          safety: { readOnly: true }
        });
      } catch (error: any) {
        this.logger.error('Intent explanation error', error);
        res.status(500).json({ 
          error: 'Explanation failed',
          safety: { readOnly: true }
        });
      }
    });

    // Teach concept
    this.app.post('/teach/concept', async (req, res) => {
      try {
        const { concept, userLevel = 'intermediate' } = req.body;
        
        if (!concept) {
          return res.status(400).json({ 
            error: 'Missing required field: concept' 
          });
        }

        const response = await this.teacher.teach({
          type: 'teach_concept',
          topic: concept,
          userLevel
        });
        
        res.json({
          success: true,
          ...response,
          safety: { readOnly: true }
        });
      } catch (error: any) {
        this.logger.error('Concept teaching error', error);
        res.status(500).json({ 
          error: 'Teaching failed',
          safety: { readOnly: true }
        });
      }
    });

    // Explain workflow
    this.app.post('/explain/workflow', async (req, res) => {
      try {
        const { workflow, userLevel = 'intermediate' } = req.body;
        
        if (!workflow) {
          return res.status(400).json({ 
            error: 'Missing required field: workflow' 
          });
        }

        const response = await this.teacher.teach({
          type: 'explain_workflow',
          topic: workflow,
          userLevel
        });
        
        res.json({
          success: true,
          ...response,
          safety: { readOnly: true }
        });
      } catch (error: any) {
        this.logger.error('Workflow explanation error', error);
        res.status(500).json({ 
          error: 'Explanation failed',
          safety: { readOnly: true }
        });
      }
    });

    // Get available topics
    this.app.get('/topics', async (req, res) => {
      try {
        const topics = await this.teacher.getAvailableTopics();
        res.json({
          success: true,
          topics,
          safety: { readOnly: true }
        });
      } catch (error: any) {
        this.logger.error('Topics error', error);
        res.status(500).json({ 
          error: 'Failed to get topics',
          safety: { readOnly: true }
        });
      }
    });

    // Get documentation
    this.app.get('/docs', async (req, res) => {
      try {
        const { topic } = req.query;
        const docs = await this.teacher.getDocumentation(topic as string);
        
        if (typeof docs === 'string') {
          res.json({
            success: true,
            topic,
            documentation: docs,
            safety: { readOnly: true }
          });
        } else {
          res.json({
            success: true,
            documentation: docs,
            safety: { readOnly: true }
          });
        }
      } catch (error: any) {
        this.logger.error('Documentation error', error);
        res.status(500).json({ 
          error: 'Failed to get documentation',
          safety: { readOnly: true }
        });
      }
    });

    // System information
    this.app.get('/info', async (req, res) => {
      try {
        const info = await this.teacher.getSystemInfo();
        res.json({
          success: true,
          ...info,
          safety: {
            readOnly: true,
            isolated: true,
            impact: 'none'
          }
        });
      } catch (error: any) {
        this.logger.error('Info error', error);
        res.status(500).json({ 
          error: 'Failed to get system info',
          safety: { readOnly: true }
        });
      }
    });

    // LLM status
    this.app.get('/llm/status', async (req, res) => {
      try {
        const available = await this.teacher.isLLMAvailable();
        res.json({
          success: true,
          llmAvailable: available,
          fallbackAvailable: true, // Always has static content
          safety: { readOnly: true }
        });
      } catch (error: any) {
        this.logger.error('LLM status error', error);
        res.status(500).json({ 
          error: 'Failed to check LLM status',
          safety: { readOnly: true }
        });
      }
    });

    // Example usage endpoint
    this.app.get('/examples', (req, res) => {
      res.json({
        success: true,
        examples: [
          {
            description: "Explain intent detection",
            endpoint: "POST /explain/intent",
            body: {
              intent: "booking.create",
              userLevel: "beginner"
            }
          },
          {
            description: "Teach business automation concept",
            endpoint: "POST /teach/concept",
            body: {
              concept: "workflow_execution",
              userLevel: "intermediate"
            }
          },
          {
            description: "Explain system component",
            endpoint: "POST /explain/system",
            body: {
              topic: "smart_suggestions",
              userLevel: "advanced"
            }
          }
        ],
        safety: { readOnly: true }
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ 
        error: 'Teaching endpoint not found',
        availableEndpoints: [
          'GET /health',
          'GET /safety',
          'POST /teach',
          'POST /explain/system',
          'POST /explain/intent',
          'POST /teach/concept',
          'POST /explain/workflow',
          'GET /topics',
          'GET /docs',
          'GET /info',
          'GET /llm/status',
          'GET /examples'
        ],
        safety: { readOnly: true }
      });
    });

    // Error handler
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.logger.error('Unhandled error in teaching server', err);
      res.status(500).json({ 
        error: 'Internal server error',
        safety: { readOnly: true, noSystemImpact: true }
      });
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.app.listen(this.port, () => {
          this.logger.info(`🎓 Sandbox Teaching Server started on port ${this.port}`);
          this.logger.info('🔒 This server is READ-ONLY and cannot affect system operations');
          this.logger.info('📚 Available for educational purposes only');
          resolve();
        });
      } catch (error) {
        this.logger.error('Failed to start teaching server', error);
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    this.logger.info('Teaching server stopped');
  }

  getApp(): express.Application {
    return this.app;
  }

  getPort(): number {
    return this.port;
  }
}
