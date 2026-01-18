export interface Feedback {
  id: string;
  source: 'github' | 'gmail' | 'other';
  content: string;
  author?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
}

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  emotion: string;
  urgency: number; // 1-10
  reasoning: string;
  theme?: string; // Optional theme (detected in sentiment chain)
}

export interface ClusteringResult {
  clusterId: string;
  feedbackIds: string[];
  theme: string;
  count: number;
}

export interface Summary {
  summary: string;
  keyPoints: string[];
  sentiment: SentimentAnalysis;
}

export interface ActionItem {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  relatedFeedbackIds: string[];
  category?: string;
}

export interface AnalysisResult {
  feedback: Feedback;
  sentiment: SentimentAnalysis;
  clusterId?: string;
  summary?: Summary;
  actionItems?: ActionItem[];
}
