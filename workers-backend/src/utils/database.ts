import type { Env } from '../types/env';
import type { Feedback, SentimentAnalysisResult } from '../types/feedback';

/**
 * Database utility functions for D1 database operations
 */

export interface StoredFeedback extends Feedback {
  created_at?: string;
  updated_at?: string;
}

export interface StoredAnalysisResult extends SentimentAnalysisResult {
  id: string;
  feedback_id: string;
  created_at?: string;
}

/**
 * Initialize database schema (run migrations)
 */
export async function initDatabase(env: Env): Promise<void> {
  if (!env.DB) {
    console.warn('Database not available, skipping initialization');
    return;
  }

  try {
    // Check if tables exist
    const tables = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('feedback', 'analysis_results')"
    ).all();

    if (tables.results && tables.results.length === 2) {
      console.log('Database tables already exist');
      return;
    }

    // Create feedback table
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT,
        timestamp TEXT NOT NULL,
        metadata TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `).run();

    // Create analysis_results table
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS analysis_results (
        id TEXT PRIMARY KEY,
        feedback_id TEXT NOT NULL,
        sentiment TEXT NOT NULL,
        score REAL NOT NULL,
        confidence REAL NOT NULL,
        emotion TEXT NOT NULL,
        urgency INTEGER NOT NULL DEFAULT 1,
        theme TEXT NOT NULL DEFAULT 'Other',
        reasoning TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE
      )
    `).run();

    // Create indexes
    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_feedback_source ON feedback(source)
    `).run();

    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON feedback(timestamp)
    `).run();

    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_analysis_sentiment ON analysis_results(sentiment)
    `).run();

    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_analysis_theme ON analysis_results(theme)
    `).run();

    await env.DB.prepare(`
      CREATE INDEX IF NOT EXISTS idx_analysis_feedback_id ON analysis_results(feedback_id)
    `).run();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Store feedback item in database
 */
export async function storeFeedback(
  feedback: Feedback,
  env: Env
): Promise<void> {
  if (!env.DB) {
    console.warn('Database not available, skipping storage');
    return;
  }

  try {
    const metadataJson = feedback.metadata ? JSON.stringify(feedback.metadata) : null;

    await env.DB.prepare(`
      INSERT OR REPLACE INTO feedback (id, source, content, author, timestamp, metadata, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      feedback.id,
      feedback.source,
      feedback.content,
      feedback.author || null,
      feedback.timestamp,
      metadataJson
    ).run();
  } catch (error) {
    console.error('Error storing feedback:', error);
    throw error;
  }
}

/**
 * Store multiple feedback items in database
 */
export async function storeFeedbackBatch(
  feedbackItems: Feedback[],
  env: Env
): Promise<void> {
  if (!env.DB) {
    console.warn('Database not available, skipping batch storage');
    return;
  }

  try {
    // Use batch insert for better performance
    const stmt = env.DB.prepare(`
      INSERT OR REPLACE INTO feedback (id, source, content, author, timestamp, metadata, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    const batch = env.DB.batch(
      feedbackItems.map((feedback) => {
        const metadataJson = feedback.metadata ? JSON.stringify(feedback.metadata) : null;
        return stmt.bind(
          feedback.id,
          feedback.source,
          feedback.content,
          feedback.author || null,
          feedback.timestamp,
          metadataJson
        );
      })
    );

    await batch;
    console.log(`Stored ${feedbackItems.length} feedback items in database`);
  } catch (error) {
    console.error('Error storing feedback batch:', error);
    throw error;
  }
}

/**
 * Store analysis result in database
 */
export async function storeAnalysisResult(
  feedbackId: string,
  analysis: SentimentAnalysisResult,
  env: Env
): Promise<string> {
  if (!env.DB) {
    console.warn('Database not available, skipping analysis storage');
    return `analysis-${Date.now()}-${Math.random()}`;
  }

  try {
    const analysisId = `analysis-${Date.now()}-${Math.random()}`;

    await env.DB.prepare(`
      INSERT OR REPLACE INTO analysis_results 
      (id, feedback_id, sentiment, score, confidence, emotion, urgency, theme, reasoning)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      analysisId,
      feedbackId,
      analysis.sentiment,
      analysis.score,
      analysis.confidence,
      analysis.emotion,
      analysis.urgency,
      analysis.theme || 'Other',
      analysis.reasoning
    ).run();

    return analysisId;
  } catch (error) {
    console.error('Error storing analysis result:', error);
    throw error;
  }
}

/**
 * Store multiple analysis results in database
 */
export async function storeAnalysisResultsBatch(
  feedbackItems: Feedback[],
  analysisResults: SentimentAnalysisResult[],
  env: Env
): Promise<void> {
  if (!env.DB) {
    console.warn('Database not available, skipping batch analysis storage');
    return;
  }

  try {
    const stmt = env.DB.prepare(`
      INSERT OR REPLACE INTO analysis_results 
      (id, feedback_id, sentiment, score, confidence, emotion, urgency, theme, reasoning)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const batch = env.DB.batch(
      feedbackItems.map((feedback, index) => {
        const analysis = analysisResults[index];
        const analysisId = `analysis-${Date.now()}-${index}-${Math.random()}`;
        return stmt.bind(
          analysisId,
          feedback.id,
          analysis.sentiment,
          analysis.score,
          analysis.confidence,
          analysis.emotion,
          analysis.urgency,
          analysis.theme || 'Other',
          analysis.reasoning
        );
      })
    );

    await batch;
    console.log(`Stored ${analysisResults.length} analysis results in database`);
  } catch (error) {
    console.error('Error storing analysis results batch:', error);
    throw error;
  }
}

/**
 * Get feedback by ID
 */
export async function getFeedback(
  id: string,
  env: Env
): Promise<StoredFeedback | null> {
  if (!env.DB) {
    return null;
  }

  try {
    const result = await env.DB.prepare(`
      SELECT * FROM feedback WHERE id = ?
    `).bind(id).first<StoredFeedback>();

    if (result) {
      result.metadata = result.metadata ? JSON.parse(result.metadata as string) : {};
    }

    return result || null;
  } catch (error) {
    console.error('Error getting feedback:', error);
    return null;
  }
}

/**
 * Get all feedback items
 */
export async function getAllFeedback(
  env: Env,
  limit: number = 100,
  offset: number = 0
): Promise<StoredFeedback[]> {
  if (!env.DB) {
    return [];
  }

  try {
    const results = await env.DB.prepare(`
      SELECT * FROM feedback 
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all<StoredFeedback>();

    return (results.results || []).map((item) => ({
      ...item,
      metadata: item.metadata ? JSON.parse(item.metadata as string) : {},
    }));
  } catch (error) {
    console.error('Error getting all feedback:', error);
    return [];
  }
}

/**
 * Get analysis result by feedback ID
 */
export async function getAnalysisResult(
  feedbackId: string,
  env: Env
): Promise<StoredAnalysisResult | null> {
  if (!env.DB) {
    return null;
  }

  try {
    const result = await env.DB.prepare(`
      SELECT * FROM analysis_results WHERE feedback_id = ? ORDER BY created_at DESC LIMIT 1
    `).bind(feedbackId).first<StoredAnalysisResult>();

    return result || null;
  } catch (error) {
    console.error('Error getting analysis result:', error);
    return null;
  }
}

/**
 * Get feedback with analysis results
 */
export async function getFeedbackWithAnalysis(
  limit: number = 100,
  offset: number = 0,
  env: Env
): Promise<Array<StoredFeedback & { analysis?: StoredAnalysisResult }>> {
  if (!env.DB) {
    return [];
  }

  try {
    const results = await env.DB.prepare(`
      SELECT 
        f.*,
        a.id as analysis_id,
        a.sentiment,
        a.score,
        a.confidence,
        a.emotion,
        a.urgency,
        a.theme,
        a.reasoning,
        a.created_at as analysis_created_at
      FROM feedback f
      LEFT JOIN analysis_results a ON f.id = a.feedback_id
      ORDER BY f.timestamp DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all<any>();

    return (results.results || []).map((row) => {
      const feedback: StoredFeedback & { analysis?: StoredAnalysisResult } = {
        id: row.id,
        source: row.source as any,
        content: row.content,
        author: row.author,
        timestamp: row.timestamp,
        metadata: row.metadata ? JSON.parse(row.metadata as string) : {},
        created_at: row.created_at,
        updated_at: row.updated_at,
      };

      if (row.analysis_id) {
        feedback.analysis = {
          id: row.analysis_id,
          feedback_id: row.id,
          sentiment: row.sentiment as any,
          score: row.score,
          confidence: row.confidence,
          emotion: row.emotion,
          urgency: row.urgency,
          theme: row.theme,
          reasoning: row.reasoning,
          created_at: row.analysis_created_at,
        };
      }

      return feedback;
    });
  } catch (error) {
    console.error('Error getting feedback with analysis:', error);
    return [];
  }
}

/**
 * Get sentiment statistics
 */
export async function getSentimentStats(env: Env): Promise<{
  total: number;
  positive: number;
  negative: number;
  neutral: number;
}> {
  if (!env.DB) {
    return { total: 0, positive: 0, negative: 0, neutral: 0 };
  }

  try {
    const total = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM analysis_results
    `).first<{ count: number }>();

    const positive = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM analysis_results WHERE sentiment = 'positive'
    `).first<{ count: number }>();

    const negative = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM analysis_results WHERE sentiment = 'negative'
    `).first<{ count: number }>();

    const neutral = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM analysis_results WHERE sentiment = 'neutral'
    `).first<{ count: number }>();

    return {
      total: total?.count || 0,
      positive: positive?.count || 0,
      negative: negative?.count || 0,
      neutral: neutral?.count || 0,
    };
  } catch (error) {
    console.error('Error getting sentiment stats:', error);
    return { total: 0, positive: 0, negative: 0, neutral: 0 };
  }
}
