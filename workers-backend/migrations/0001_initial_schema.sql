-- Initial schema for Sentiflow feedback analysis database

-- Feedback table - stores raw feedback items
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  timestamp TEXT NOT NULL,
  metadata TEXT, -- JSON string
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Analysis results table - stores sentiment analysis results
CREATE TABLE IF NOT EXISTS analysis_results (
  id TEXT PRIMARY KEY,
  feedback_id TEXT NOT NULL,
  sentiment TEXT NOT NULL, -- 'positive', 'negative', 'neutral'
  score REAL NOT NULL,
  confidence REAL NOT NULL,
  emotion TEXT NOT NULL,
  urgency INTEGER NOT NULL DEFAULT 1,
  theme TEXT NOT NULL DEFAULT 'Other',
  reasoning TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_source ON feedback(source);
CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON feedback(timestamp);
CREATE INDEX IF NOT EXISTS idx_analysis_sentiment ON analysis_results(sentiment);
CREATE INDEX IF NOT EXISTS idx_analysis_theme ON analysis_results(theme);
CREATE INDEX IF NOT EXISTS idx_analysis_feedback_id ON analysis_results(feedback_id);
