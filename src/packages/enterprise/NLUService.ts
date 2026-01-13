import type { NLUIntent, PromptContext } from "../core/types.js";

export interface NLUEntity {
  type: string;
  value: string;
  start: number;
  end: number;
}

export interface NLUTrainingExample {
  text: string;
  intent: string;
  entities: NLUEntity[];
}

export interface IntentPattern {
  intent: string;
  patterns: string[];
  entities?: Array<{
    type: string;
    patterns: RegExp[];
  }>;
}

export class NLUService {
  private patterns: IntentPattern[] = [];
  private trainingData: NLUTrainingExample[] = [];

  addIntentPattern(pattern: IntentPattern): void {
    this.patterns.push(pattern);
  }

  addTrainingData(examples: NLUTrainingExample[]): void {
    this.trainingData.push(...examples);
  }

  parse(text: string): NLUIntent {
    const lowerText = text.toLowerCase();
    
    // Try to match against patterns
    for (const pattern of this.patterns) {
      for (const patternText of pattern.patterns) {
        if (lowerText.includes(patternText.toLowerCase())) {
          const entities = this.extractEntities(text, pattern);
          return {
            intent: pattern.intent,
            confidence: this.calculateConfidence(text, pattern),
            entities
          };
        }
      }
    }

    // Fallback to training data similarity
    const bestMatch = this.findBestMatch(text);
    if (bestMatch) {
      return bestMatch;
    }

    // Default intent
    return {
      intent: "unknown",
      confidence: 0.1,
      entities: []
    };
  }

  private extractEntities(text: string, pattern: IntentPattern): NLUEntity[] {
    const entities: NLUEntity[] = [];
    
    if (!pattern.entities) return entities;

    for (const entityPattern of pattern.entities) {
      for (const regex of entityPattern.patterns) {
        const matches = text.matchAll(regex);
        for (const match of matches) {
          if (match.index !== undefined) {
            entities.push({
              type: entityPattern.type,
              value: match[0],
              start: match.index,
              end: match.index + match[0].length
            });
          }
        }
      }
    }

    return entities;
  }

  private calculateConfidence(text: string, pattern: IntentPattern): number {
    const lowerText = text.toLowerCase();
    let maxConfidence = 0;

    for (const patternText of pattern.patterns) {
      const similarity = this.stringSimilarity(lowerText, patternText.toLowerCase());
      maxConfidence = Math.max(maxConfidence, similarity);
    }

    return Math.min(maxConfidence, 1.0);
  }

  private findBestMatch(text: string): NLUIntent | null {
    let bestMatch: NLUIntent | null = null;
    let highestConfidence = 0;

    for (const example of this.trainingData) {
      const similarity = this.stringSimilarity(text.toLowerCase(), example.text.toLowerCase());
      if (similarity > highestConfidence && similarity > 0.3) {
        highestConfidence = similarity;
        bestMatch = {
          intent: example.intent,
          confidence: similarity,
          entities: example.entities
        };
      }
    }

    return bestMatch;
  }

  private stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  getIntents(): string[] {
    return [...new Set([...this.patterns.map(p => p.intent), ...this.trainingData.map(e => e.intent)])];
  }

  getPatternCount(): number {
    return this.patterns.length;
  }

  getTrainingDataCount(): number {
    return this.trainingData.length;
  }

  // Predefined patterns for common booking/intent scenarios
  initializeDefaultPatterns(): void {
    this.addIntentPattern({
      intent: "book_appointment",
      patterns: [
        "book appointment",
        "schedule appointment",
        "make appointment",
        "book a time",
        "schedule with",
        "I want to book",
        "can I schedule",
        "need to make an appointment"
      ],
      entities: [
        {
          type: "date",
          patterns: [
            /\b(today|tomorrow|next week|next month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
            /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})\b/g
          ]
        },
        {
          type: "time",
          patterns: [
            /\b(\d{1,2}:\d{2}\s?(am|pm)?)\b/gi,
            /\b(morning|afternoon|evening|night)\b/gi
          ]
        }
      ]
    });

    this.addIntentPattern({
      intent: "cancel_appointment",
      patterns: [
        "cancel appointment",
        "cancel booking",
        "need to cancel",
        "cancel my appointment",
        "reschedule"
      ]
    });

    this.addIntentPattern({
      intent: "check_availability",
      patterns: [
        "what times are available",
        "when are you free",
        "check availability",
        "available times",
        "open slots",
        "what times do you have"
      ]
    });

    this.addIntentPattern({
      intent: "pricing_inquiry",
      patterns: [
        "how much",
        "what's the price",
        "cost",
        "pricing",
        "how much does it cost",
        "rates",
        "fees"
      ]
    });

    this.addIntentPattern({
      intent: "service_inquiry",
      patterns: [
        "what services",
        "what do you offer",
        "services available",
        "what can you do",
        "service options"
      ]
    });
  }
}
