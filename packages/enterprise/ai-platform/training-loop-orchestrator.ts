/**
 * Training Loop Orchestrator
 * 
 * Automates the complete training loop from feedback collection to model deployment:
 * 1. Monitor feedback metrics
 * 2. Trigger retraining when thresholds met
 * 3. Convert feedback to training data
 * 4. Launch training jobs
 * 5. Evaluate new models
 * 6. A/B test before deployment
 * 7. Deploy successful models
 * 
 * Provides full automation with human oversight options.
 */

import type { FeedbackEntry } from './feedback-collector.js';
import type { LearningInsight } from './supervised-learner.js';
import { TrainingDataPipeline, type TrainingDataset } from './training-data-pipeline.js';

export type TrainingTrigger = 'manual' | 'scheduled' | 'threshold' | 'performance';
export type TrainingStatus = 'idle' | 'collecting' | 'preparing' | 'training' | 'evaluating' | 'testing' | 'deploying';

export interface TrainingJob {
  id: string;
  trigger: TrainingTrigger;
  status: TrainingStatus;
  startedAt: Date;
  completedAt?: Date;
  
  // Data
  feedbackCount: number;
  trainingDataset?: TrainingDataset;
  
  // Training
  baseModel: string;
  trainingConfig?: any;
  
  // Results
  newModelVersion?: string;
  metrics?: {
    trainingLoss?: number;
    validationAccuracy?: number;
    avgRating?: number;
  };
  
  // A/B Testing
  abTestId?: string;
  abTestResults?: {
    controlSuccessRate: number;
    variantSuccessRate: number;
    improvement: number;
    sampleSize: number;
    pValue?: number;
  };
  
  // Deployment
  deployed: boolean;
  deployedAt?: Date;
  
  // Errors
  error?: string;
}

export interface RetrainingThresholds {
  // Feedback volume
  minFeedbackCount?: number;        // Min feedback to trigger retraining
  maxFeedbackCount?: number;        // Max to accumulate before forced retrain
  
  // Quality thresholds
  minSuccessRate?: number;          // Min success rate before retrain
  maxErrorRate?: number;            // Max error rate before retrain
  minAvgRating?: number;            // Min avg rating before retrain
  
  // Time-based
  maxDaysSinceRetrain?: number;     // Max days without retraining
  
  // Performance degradation
  maxPerformanceDrop?: number;      // Max % drop in performance
}

export interface ABTestConfig {
  enabled: boolean;
  trafficSplit: number;            // 0-1, percent to variant
  minSampleSize: number;           // Min samples per variant
  maxDuration: number;             // Max test duration (seconds)
  significanceLevel: number;       // Statistical significance (p-value)
  minImprovement: number;          // Min improvement to deploy (%)
}

interface OrchestratorConfig {
  // Retraining triggers
  thresholds: RetrainingThresholds;
  
  // Schedule
  schedule?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  scheduleTime?: string;  // e.g., "02:00" for 2 AM
  
  // A/B Testing
  abTest: ABTestConfig;
  
  // Training
  baseModel: string;
  trainingTimeout: number;  // seconds
  
  // Approval
  requireApproval: boolean;
  autoDeployThreshold?: number;  // Auto-deploy if improvement > %
  
  // Storage
  dataDir?: string;
}

/**
 * Training Loop Orchestrator
 * Automates the complete ML training lifecycle
 */
export class TrainingLoopOrchestrator {
  private config: OrchestratorConfig;
  private pipeline: TrainingDataPipeline;
  private jobs: TrainingJob[] = [];
  private running = false;
  private lastRetrainAt?: Date;
  private scheduleTimer?: NodeJS.Timeout;

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = {
      thresholds: {
        minFeedbackCount: 100,
        maxFeedbackCount: 1000,
        minSuccessRate: 0.80,
        maxErrorRate: 0.20,
        minAvgRating: 3.5,
        maxDaysSinceRetrain: 30,
        maxPerformanceDrop: 0.10  // 10% drop
      },
      schedule: 'daily',
      abTest: {
        enabled: true,
        trafficSplit: 0.5,
        minSampleSize: 100,
        maxDuration: 7 * 24 * 60 * 60,  // 7 days
        significanceLevel: 0.05,
        minImprovement: 0.05  // 5% improvement
      },
      baseModel: 'gpt-3.5-turbo',
      trainingTimeout: 3600,  // 1 hour
      requireApproval: true,
      dataDir: './data/training',
      ...config
    };

    this.pipeline = new TrainingDataPipeline({
      minRating: 4,
      requireHelpful: true,
      deduplicate: true
    });
  }

  /**
   * Start the training loop orchestrator
   */
  async start(): Promise<void> {
    if (this.running) {
      throw new Error('Orchestrator already running');
    }

    this.running = true;
    console.log('Training Loop Orchestrator started');

    // Start scheduled retraining if configured
    if (this.config.schedule) {
      this.startSchedule();
    }
  }

  /**
   * Stop the orchestrator
   */
  async stop(): Promise<void> {
    this.running = false;
    
    if (this.scheduleTimer) {
      clearInterval(this.scheduleTimer);
      this.scheduleTimer = undefined;
    }

    console.log('Training Loop Orchestrator stopped');
  }

  /**
   * Check if retraining should be triggered
   */
  shouldRetrain(metrics: {
    feedbackCount: number;
    successRate: number;
    avgRating: number;
    errorRate?: number;
  }): {
    shouldRetrain: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    const thresholds = this.config.thresholds;

    // Check feedback volume
    if (thresholds.minFeedbackCount && metrics.feedbackCount >= thresholds.minFeedbackCount) {
      reasons.push(`Feedback count (${metrics.feedbackCount}) >= threshold (${thresholds.minFeedbackCount})`);
    }

    if (thresholds.maxFeedbackCount && metrics.feedbackCount >= thresholds.maxFeedbackCount) {
      reasons.push(`Feedback count (${metrics.feedbackCount}) >= max threshold (${thresholds.maxFeedbackCount}) - FORCED`);
    }

    // Check quality thresholds
    if (thresholds.minSuccessRate && metrics.successRate < thresholds.minSuccessRate) {
      reasons.push(`Success rate (${(metrics.successRate * 100).toFixed(1)}%) < threshold (${(thresholds.minSuccessRate * 100).toFixed(1)}%)`);
    }

    if (thresholds.maxErrorRate && metrics.errorRate && metrics.errorRate > thresholds.maxErrorRate) {
      reasons.push(`Error rate (${(metrics.errorRate * 100).toFixed(1)}%) > threshold (${(thresholds.maxErrorRate * 100).toFixed(1)}%)`);
    }

    if (thresholds.minAvgRating && metrics.avgRating < thresholds.minAvgRating) {
      reasons.push(`Avg rating (${metrics.avgRating.toFixed(1)}) < threshold (${thresholds.minAvgRating})`);
    }

    // Check time since last retrain
    if (thresholds.maxDaysSinceRetrain && this.lastRetrainAt) {
      const daysSince = (Date.now() - this.lastRetrainAt.getTime()) / (24 * 60 * 60 * 1000);
      if (daysSince >= thresholds.maxDaysSinceRetrain) {
        reasons.push(`Days since last retrain (${daysSince.toFixed(0)}) >= threshold (${thresholds.maxDaysSinceRetrain})`);
      }
    }

    return {
      shouldRetrain: reasons.length > 0,
      reasons
    };
  }

  /**
   * Trigger a training job
   */
  async triggerTraining(
    feedback: FeedbackEntry[],
    trigger: TrainingTrigger = 'manual',
    options?: {
      baseModel?: string;
      skipABTest?: boolean;
      autoApprove?: boolean;
    }
  ): Promise<TrainingJob> {
    const job: TrainingJob = {
      id: this.generateJobId(),
      trigger,
      status: 'preparing',
      startedAt: new Date(),
      feedbackCount: feedback.length,
      baseModel: options?.baseModel || this.config.baseModel,
      deployed: false
    };

    this.jobs.push(job);
    console.log(`Training job ${job.id} triggered (${trigger})`);

    try {
      // Step 1: Prepare training data
      job.status = 'preparing';
      const dataset = await this.prepareTrainingData(feedback);
      job.trainingDataset = dataset;

      console.log(`Training data prepared: ${dataset.examples.length} examples`);

      // Step 2: Train model
      job.status = 'training';
      const modelVersion = await this.trainModel(dataset, job.baseModel);
      job.newModelVersion = modelVersion;

      console.log(`Model trained: ${modelVersion}`);

      // Step 3: Evaluate model
      job.status = 'evaluating';
      const metrics = await this.evaluateModel(modelVersion);
      job.metrics = metrics;

      console.log(`Model evaluated:`, metrics);

      // Step 4: A/B test (if enabled)
      if (this.config.abTest.enabled && !options?.skipABTest) {
        job.status = 'testing';
        const testResults = await this.runABTest(job.baseModel, modelVersion);
        job.abTestResults = testResults;

        console.log(`A/B test results:`, testResults);

        // Check if improvement is significant
        const meetsThreshold = testResults.improvement >= this.config.abTest.minImprovement;
        const isSignificant = (testResults.pValue || 1) < this.config.abTest.significanceLevel;

        if (!meetsThreshold || !isSignificant) {
          job.status = 'idle';
          job.error = `A/B test failed: improvement=${(testResults.improvement * 100).toFixed(1)}%, p-value=${testResults.pValue?.toFixed(3)}`;
          job.completedAt = new Date();
          return job;
        }
      }

      // Step 5: Deploy (if approved)
      job.status = 'deploying';
      
      const autoApprove = options?.autoApprove || 
        (!this.config.requireApproval) ||
        (job.abTestResults && job.abTestResults.improvement >= (this.config.autoDeployThreshold || 0.15));

      if (autoApprove) {
        await this.deployModel(modelVersion);
        job.deployed = true;
        job.deployedAt = new Date();
        console.log(`Model ${modelVersion} deployed automatically`);
      } else {
        console.log(`Model ${modelVersion} ready for manual approval`);
      }

      job.status = 'idle';
      job.completedAt = new Date();
      this.lastRetrainAt = new Date();

      return job;

    } catch (error) {
      job.status = 'idle';
      job.error = error instanceof Error ? error.message : String(error);
      job.completedAt = new Date();
      console.error(`Training job ${job.id} failed:`, error);
      return job;
    }
  }

  /**
   * Get all training jobs
   */
  getJobs(): TrainingJob[] {
    return [...this.jobs];
  }

  /**
   * Get active job
   */
  getActiveJob(): TrainingJob | null {
    return this.jobs.find(j => j.status !== 'idle') || null;
  }

  /**
   * Get jobs requiring approval
   */
  getJobsAwaitingApproval(): TrainingJob[] {
    return this.jobs.filter(j => 
      j.status === 'deploying' && 
      !j.deployed && 
      !j.error
    );
  }

  /**
   * Approve and deploy a job
   */
  async approveJob(jobId: string): Promise<void> {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (!job.newModelVersion) {
      throw new Error(`Job ${jobId} has no model version`);
    }

    await this.deployModel(job.newModelVersion);
    job.deployed = true;
    job.deployedAt = new Date();
    job.status = 'idle';
    job.completedAt = new Date();

    console.log(`Job ${jobId} approved and deployed`);
  }

  /**
   * Reject a job
   */
  async rejectJob(jobId: string, reason: string): Promise<void> {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    job.status = 'idle';
    job.error = `Rejected: ${reason}`;
    job.completedAt = new Date();

    console.log(`Job ${jobId} rejected: ${reason}`);
  }

  /**
   * Prepare training data from feedback
   */
  private async prepareTrainingData(feedback: FeedbackEntry[]): Promise<TrainingDataset> {
    return this.pipeline.toChatCompletions(feedback, {
      systemPrompt: 'You are a helpful customer service assistant.'
    });
  }

  /**
   * Train model with prepared data
   * In practice, this would call your training infrastructure
   */
  private async trainModel(dataset: TrainingDataset, baseModel: string): Promise<string> {
    // Placeholder - integrate with your training infrastructure
    console.log(`Training model based on ${baseModel} with ${dataset.examples.length} examples...`);
    
    // Simulate training delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return new model version
    const version = `${baseModel}-ft-${Date.now()}`;
    return version;
  }

  /**
   * Evaluate model performance
   */
  private async evaluateModel(modelVersion: string): Promise<any> {
    // Placeholder - run evaluation suite
    console.log(`Evaluating model ${modelVersion}...`);
    
    return {
      validationAccuracy: 0.85 + Math.random() * 0.10,
      avgRating: 4.0 + Math.random() * 0.8
    };
  }

  /**
   * Run A/B test between models
   */
  private async runABTest(controlModel: string, variantModel: string): Promise<any> {
    // Placeholder - run A/B test
    console.log(`Running A/B test: ${controlModel} vs ${variantModel}...`);
    
    const controlRate = 0.80 + Math.random() * 0.10;
    const variantRate = 0.85 + Math.random() * 0.10;
    
    return {
      controlSuccessRate: controlRate,
      variantSuccessRate: variantRate,
      improvement: (variantRate - controlRate) / controlRate,
      sampleSize: 100,
      pValue: 0.02
    };
  }

  /**
   * Deploy model to production
   */
  private async deployModel(modelVersion: string): Promise<void> {
    // Placeholder - deploy model
    console.log(`Deploying model ${modelVersion}...`);
    
    // In practice, update model registry, routing, etc.
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Start scheduled retraining
   */
  private startSchedule(): void {
    const intervals = {
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    };

    const interval = intervals[this.config.schedule!];
    
    this.scheduleTimer = setInterval(() => {
      console.log(`Scheduled training check (${this.config.schedule})`);
      // In practice, check metrics and trigger if needed
    }, interval);

    console.log(`Scheduled retraining enabled: ${this.config.schedule}`);
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `train_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { TrainingLoopOrchestrator };
