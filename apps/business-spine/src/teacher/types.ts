export interface TeacherRequest {
  type: 'explain_operation' | 'explain_intent' | 'explain_suggestion' | 'explain_decision' | 'teach_concept';
  operation?: string;
  intent?: any;
  suggestion?: any;
  context?: any;
  result?: any;
  concept?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface TeacherExplanation {
  type: string;
  title: string;
  explanation: string;
  reasoning: string;
  confidence: number;
  examples?: string[];
  alternatives?: string[];
  nextSteps?: string[];
  relatedConcepts?: string[];
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
}

export interface TeacherResponse {
  success: boolean;
  explanation?: TeacherExplanation;
  error?: string;
  metadata?: {
    processingTime: number;
    llmUsed: boolean;
    confidence: number;
  };
}
