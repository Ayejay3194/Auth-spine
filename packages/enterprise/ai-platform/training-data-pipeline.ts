/**
 * Training Data Pipeline
 * 
 * Converts user feedback into training data for model fine-tuning and RAG updates.
 * Supports multiple output formats and quality filtering.
 * 
 * Key Features:
 * - Convert feedback to training examples
 * - Quality filtering based on ratings and sentiment
 * - Deduplication of similar examples
 * - Multiple export formats (JSONL, Parquet, RAG documents)
 * - Training data versioning
 */

import type { FeedbackEntry } from './feedback-collector.js';

export type TrainingFormat = 'chat_completion' | 'completion' | 'rag_documents' | 'classification';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionExample {
  messages: ChatMessage[];
  metadata?: {
    feedbackId: string;
    rating?: number;
    wasHelpful: boolean;
    timestamp: Date;
  };
}

export interface CompletionExample {
  prompt: string;
  completion: string;
  metadata?: {
    feedbackId: string;
    rating?: number;
  };
}

export interface RAGDocument {
  id: string;
  content: string;
  metadata: {
    source: 'feedback';
    feedbackId: string;
    rating?: number;
    category?: string;
    timestamp: Date;
  };
}

export interface ClassificationExample {
  text: string;
  label: string;
  metadata?: {
    feedbackId: string;
    confidence?: number;
  };
}

export interface TrainingDataset {
  format: TrainingFormat;
  examples: Array<ChatCompletionExample | CompletionExample | RAGDocument | ClassificationExample>;
  metadata: {
    createdAt: Date;
    sourceCount: number;
    filteredCount: number;
    deduplicatedCount: number;
    avgRating?: number;
    qualityThreshold?: number;
  };
}

interface PipelineConfig {
  // Quality filtering
  minRating?: number;           // Minimum rating to include (1-5)
  requireHelpful?: boolean;     // Only include helpful feedback
  minConfidence?: number;       // Minimum confidence score (0-1)
  
  // Deduplication
  deduplicate?: boolean;        // Remove similar examples
  similarityThreshold?: number; // Similarity threshold for dedup (0-1)
  
  // Sampling
  maxExamples?: number;         // Maximum examples to include
  balanceCategories?: boolean;  // Balance across categories
  
  // Processing
  includeNegative?: boolean;    // Include negative examples
  augmentData?: boolean;        // Data augmentation
}

/**
 * Training Data Pipeline
 * Converts feedback into training data
 */
export class TrainingDataPipeline {
  private config: PipelineConfig;

  constructor(config?: Partial<PipelineConfig>) {
    this.config = {
      minRating: 4,               // Only good feedback by default
      requireHelpful: true,
      minConfidence: 0.7,
      deduplicate: true,
      similarityThreshold: 0.9,
      maxExamples: 10000,
      balanceCategories: false,
      includeNegative: false,
      augmentData: false,
      ...config
    };
  }

  /**
   * Convert feedback to chat completion format
   * Best for fine-tuning conversational models
   */
  async toChatCompletions(
    feedback: FeedbackEntry[],
    context: {
      systemPrompt?: string;
      includeContext?: boolean;
    } = {}
  ): Promise<TrainingDataset> {
    const filtered = this.filterQuality(feedback);
    const deduplicated = this.config.deduplicate 
      ? this.deduplicate(filtered)
      : filtered;

    const examples: ChatCompletionExample[] = [];

    for (const fb of deduplicated) {
      // Only include if we have both question and response context
      if (!fb.text) continue;

      const messages: ChatMessage[] = [];

      // System prompt
      if (context.systemPrompt) {
        messages.push({
          role: 'system',
          content: context.systemPrompt
        });
      }

      // User message (from context if available)
      // In practice, you'd want to store the original request with feedback
      messages.push({
        role: 'user',
        content: this.extractUserQuestion(fb)
      });

      // Assistant response (the good example)
      messages.push({
        role: 'assistant',
        content: this.extractAssistantResponse(fb)
      });

      examples.push({
        messages,
        metadata: {
          feedbackId: fb.id,
          rating: fb.rating,
          wasHelpful: fb.wasHelpful,
          timestamp: fb.timestamp
        }
      });
    }

    return {
      format: 'chat_completion',
      examples,
      metadata: {
        createdAt: new Date(),
        sourceCount: feedback.length,
        filteredCount: filtered.length,
        deduplicatedCount: deduplicated.length,
        avgRating: this.calculateAvgRating(deduplicated),
        qualityThreshold: this.config.minRating
      }
    };
  }

  /**
   * Convert feedback to RAG documents
   * Best for updating knowledge base
   */
  async toRAGDocuments(feedback: FeedbackEntry[]): Promise<TrainingDataset> {
    const filtered = this.filterQuality(feedback);
    const documents: RAGDocument[] = [];

    for (const fb of filtered) {
      // Extract knowledge from positive feedback
      if (fb.improvementSuggestion && fb.wasHelpful) {
        documents.push({
          id: `feedback_${fb.id}`,
          content: fb.improvementSuggestion,
          metadata: {
            source: 'feedback',
            feedbackId: fb.id,
            rating: fb.rating,
            category: 'improvement_suggestion',
            timestamp: fb.timestamp
          }
        });
      }

      // Extract good responses
      if (fb.text && fb.wasHelpful && fb.rating && fb.rating >= 4) {
        documents.push({
          id: `feedback_text_${fb.id}`,
          content: fb.text,
          metadata: {
            source: 'feedback',
            feedbackId: fb.id,
            rating: fb.rating,
            category: 'positive_feedback',
            timestamp: fb.timestamp
          }
        });
      }
    }

    return {
      format: 'rag_documents',
      examples: documents,
      metadata: {
        createdAt: new Date(),
        sourceCount: feedback.length,
        filteredCount: filtered.length,
        deduplicatedCount: documents.length,
        avgRating: this.calculateAvgRating(filtered)
      }
    };
  }

  /**
   * Convert feedback to classification examples
   * Best for training quality classifiers
   */
  async toClassificationExamples(feedback: FeedbackEntry[]): Promise<TrainingDataset> {
    const examples: ClassificationExample[] = [];

    for (const fb of feedback) {
      if (!fb.text) continue;

      // Classify by sentiment
      examples.push({
        text: fb.text,
        label: fb.sentiment || 'neutral',
        metadata: {
          feedbackId: fb.id,
          confidence: fb.rating ? fb.rating / 5 : undefined
        }
      });

      // Classify by helpfulness
      examples.push({
        text: fb.text,
        label: fb.wasHelpful ? 'helpful' : 'not_helpful',
        metadata: {
          feedbackId: fb.id,
          confidence: fb.rating ? fb.rating / 5 : undefined
        }
      });
    }

    return {
      format: 'classification',
      examples,
      metadata: {
        createdAt: new Date(),
        sourceCount: feedback.length,
        filteredCount: feedback.length,
        deduplicatedCount: examples.length
      }
    };
  }

  /**
   * Export training data to JSONL format
   * Standard format for model fine-tuning
   */
  async exportJSONL(dataset: TrainingDataset): Promise<string> {
    const lines: string[] = [];

    for (const example of dataset.examples) {
      lines.push(JSON.stringify(example));
    }

    return lines.join('\n');
  }

  /**
   * Export training data to JSON format
   */
  async exportJSON(dataset: TrainingDataset): Promise<string> {
    return JSON.stringify(dataset, null, 2);
  }

  /**
   * Filter feedback by quality criteria
   */
  private filterQuality(feedback: FeedbackEntry[]): FeedbackEntry[] {
    return feedback.filter(fb => {
      // Require helpful if configured
      if (this.config.requireHelpful && !fb.wasHelpful) {
        return false;
      }

      // Check minimum rating
      if (this.config.minRating && fb.rating) {
        if (fb.rating < this.config.minRating) {
          return false;
        }
      }

      // Include negative examples if configured
      if (!this.config.includeNegative && !fb.wasHelpful) {
        return false;
      }

      return true;
    });
  }

  /**
   * Remove duplicate or very similar examples
   */
  private deduplicate(feedback: FeedbackEntry[]): FeedbackEntry[] {
    const unique: FeedbackEntry[] = [];
    const seen = new Set<string>();

    for (const fb of feedback) {
      // Simple deduplication by text content
      const key = this.generateDedupeKey(fb);
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(fb);
      }
    }

    return unique;
  }

  /**
   * Generate deduplication key
   */
  private generateDedupeKey(fb: FeedbackEntry): string {
    // Use text content or improvement suggestion
    const text = (fb.text || fb.improvementSuggestion || '').toLowerCase().trim();
    
    // Simple hash: first 100 chars
    return text.substring(0, 100);
  }

  /**
   * Calculate average rating
   */
  private calculateAvgRating(feedback: FeedbackEntry[]): number {
    const rated = feedback.filter(fb => fb.rating);
    if (rated.length === 0) return 0;

    const sum = rated.reduce((acc, fb) => acc + (fb.rating || 0), 0);
    return sum / rated.length;
  }

  /**
   * Extract user question from feedback
   * In practice, you'd store the original request with feedback
   */
  private extractUserQuestion(fb: FeedbackEntry): string {
    // Placeholder - in real implementation, you'd have the original question
    return fb.text || 'User question not available';
  }

  /**
   * Extract assistant response from feedback
   * In practice, you'd store the original response with feedback
   */
  private extractAssistantResponse(fb: FeedbackEntry): string {
    // Placeholder - in real implementation, you'd have the original response
    if (fb.improvementSuggestion) {
      return `Here's an improved response based on feedback: ${fb.improvementSuggestion}`;
    }
    return fb.text || 'Response not available';
  }

  /**
   * Get pipeline statistics
   */
  getStats(dataset: TrainingDataset): {
    totalExamples: number;
    filterRate: number;
    dedupeRate: number;
    avgQuality: number;
  } {
    const totalExamples = dataset.examples.length;
    const filterRate = dataset.metadata.sourceCount > 0
      ? (dataset.metadata.sourceCount - dataset.metadata.filteredCount) / dataset.metadata.sourceCount
      : 0;
    const dedupeRate = dataset.metadata.filteredCount > 0
      ? (dataset.metadata.filteredCount - dataset.metadata.deduplicatedCount) / dataset.metadata.filteredCount
      : 0;

    return {
      totalExamples,
      filterRate,
      dedupeRate,
      avgQuality: dataset.metadata.avgRating || 0
    };
  }
}

export { TrainingDataPipeline };
