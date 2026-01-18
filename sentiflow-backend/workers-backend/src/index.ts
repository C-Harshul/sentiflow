import { Hono } from 'hono';
import type { Env } from './types/env';
import { analyzeSentiment, analyzeSentimentBatch } from './chains/sentimentChain';
import { mockFeedbackData } from './data/mockFeedback';
import type { Feedback } from './types/feedback';
import {
  initDatabase,
  storeFeedbackBatch,
  storeAnalysisResultsBatch,
  getFeedbackWithAnalysis,
  getSentimentStats,
  getAllFeedback,
} from './utils/database';

const app = new Hono<{ Bindings: Env }>();

// Initialize database on startup (runs on first request)
let dbInitialized = false;
async function ensureDatabaseInitialized(env: Env) {
  if (!dbInitialized && env.DB) {
    try {
      await initDatabase(env);
      dbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}

// CORS middleware - updated for production
app.use('*', async (c, next) => {
  const origin = c.req.header('Origin');
  
  // Allowed origins - add your Pages domain here
  const allowedOrigins = [
    'http://localhost:8080', // Local development
    'https://c487d299.sentiflow-insights.pages.dev', // Previous Pages deployment
    'https://cbe7ccc0.sentiflow-insights.pages.dev', // Pages deployment
    'https://17c99d09.sentiflow-insights.pages.dev', // Previous Pages deployment
    'https://58b8728b.sentiflow-insights.pages.dev', // Previous Pages deployment
    'https://6d40d5c3.sentiflow-insights.pages.dev', // Previous Pages deployment
    'https://8de85f84.sentiflow-insights.pages.dev', // Previous Pages deployment
    'https://49adfff6.sentiflow-insights.pages.dev', // Previous Pages deployment
    'https://342831a5.sentiflow-insights.pages.dev', // Previous Pages deployment
    'https://3defcf48.sentiflow-insights.pages.dev', // Previous Pages deployment
    'https://acf99a07.sentiflow-insights.pages.dev', // Previous Pages deployment
    'https://bdbb895e.sentiflow-insights.pages.dev', // Previous Pages deployment
    'https://17c116e1.sentiflow-insights.pages.dev', // Latest Pages deployment
    'https://sentiflow-insights.pages.dev', // Custom subdomain if available
  ];
  
  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
  } else if (c.env?.ENVIRONMENT === 'development' || !c.env?.ENVIRONMENT) {
    // Allow all origins in development
    c.header('Access-Control-Allow-Origin', '*');
  }
  
  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS requests
  if (c.req.method === 'OPTIONS') {
    const allowedOrigin = origin && allowedOrigins.includes(origin) 
      ? origin 
      : (c.env?.ENVIRONMENT === 'development' || !c.env?.ENVIRONMENT ? '*' : '');
    
    return new Response(null, { 
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
  
  await next();
});

// Health check endpoint
app.get('/', (c) => {
  return c.json({ message: 'Sentiflow Workers Backend API', status: 'ok' });
});

// Get all feedback with sentiment analysis (frontend format)
app.get('/api/feedback', async (c) => {
  try {
    const env = c.env;
    
    // Process all feedback through sentiment analysis
    const sentimentResults = await analyzeSentimentBatch(mockFeedbackData, env);
    
    // Transform to frontend format
    const feedbackItems = mockFeedbackData.map((feedback, index) => {
      const sentiment = sentimentResults[index];
      return {
        id: feedback.id,
        source: feedback.source as 'github' | 'gmail' | 'discord' | 'twitter',
        content: feedback.content,
        sentiment: sentiment.sentiment,
        sentimentScore: sentiment.score,
        author: feedback.author || 'Unknown',
        timestamp: new Date(feedback.timestamp),
        theme: (feedback.metadata as { theme?: string })?.theme,
        // Additional sentiment analysis fields
        emotion: sentiment.emotion,
        urgency: sentiment.urgency,
        confidence: sentiment.confidence,
        reasoning: sentiment.reasoning,
      };
    });
    
    return c.json(feedbackItems);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return c.json({ 
      error: 'Failed to fetch feedback', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Analyze single feedback item endpoint
app.post('/api/analyze', async (c) => {
  try {
    const body = await c.req.json();
    const env = c.env;
    
    // Validate input
    if (!body.content) {
      return c.json({ error: 'Missing required field: content' }, 400);
    }
    
    const feedback: Feedback = {
      id: body.id || `temp-${Date.now()}`,
      source: body.source || 'other',
      content: body.content,
      author: body.author,
      timestamp: body.timestamp || new Date().toISOString(),
      metadata: body.metadata,
    };
    
    const result = await analyzeSentiment(feedback, env);
    
    return c.json({
      feedback: {
        id: feedback.id,
        source: feedback.source,
        content: feedback.content,
        author: feedback.author,
        timestamp: feedback.timestamp,
      },
      sentiment: result,
    });
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    return c.json({ 
      error: 'Failed to analyze feedback', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Batch analysis endpoint - analyzes feedback items and returns them with sentiment analysis
app.post('/api/analyze/batch', async (c) => {
  try {
    const body = await c.req.json();
    const env = c.env;
    
    if (!Array.isArray(body.feedback)) {
      return c.json({ error: 'Missing or invalid feedback array' }, 400);
    }
    
    const feedbackItems: Feedback[] = body.feedback.map((item: any) => ({
      id: item.id || `temp-${Date.now()}-${Math.random()}`,
      source: item.source || 'other',
      content: item.content,
      author: item.author,
      timestamp: item.timestamp || new Date().toISOString(),
      metadata: item.metadata || { theme: item.theme },
    }));
    
    console.log(`Processing ${feedbackItems.length} feedback items for analysis...`);
    
    // Process in smaller chunks to avoid timeout and subrequest limits
    // Cloudflare Workers free tier: 50 subrequests, 30s execution time
    // Each item needs ~2 API calls (sentiment classification + combined emotion/theme)
    // IMPORTANT: All chunks are processed in ONE request, so all subrequests count toward the 50 limit
    // For 75 items = 150 subrequests needed, but we only have 50
    // Solution: Process max 25 items per request (50 subrequests)
    // For larger batches, frontend should send multiple requests
    const MAX_ITEMS_PER_REQUEST = 25; // Max items we can process in one request (50 subrequests)
    const CHUNK_SIZE = 10; // Process 10 items per chunk (20 subrequests per chunk)
    
    // Limit the number of items we process to stay within subrequest limit
    const itemsToProcess = feedbackItems.slice(0, MAX_ITEMS_PER_REQUEST);
    if (feedbackItems.length > MAX_ITEMS_PER_REQUEST) {
      console.warn(`⚠️  Processing only first ${MAX_ITEMS_PER_REQUEST} items (${feedbackItems.length} total). Frontend should send multiple smaller requests.`);
    }
    const allResults: any[] = [];
    const allThemes: string[] = [];
    
    for (let chunkStart = 0; chunkStart < itemsToProcess.length; chunkStart += CHUNK_SIZE) {
      const chunk = itemsToProcess.slice(chunkStart, chunkStart + CHUNK_SIZE);
      console.log(`Processing chunk ${Math.floor(chunkStart / CHUNK_SIZE) + 1}/${Math.ceil(itemsToProcess.length / CHUNK_SIZE)} (${chunk.length} items)`);
      
      try {
        // Process sentiment for this chunk (now includes theme in result)
        const chunkResults = await analyzeSentimentBatch(chunk, env);
        allResults.push(...chunkResults);
        
        // Extract themes from sentiment results (theme is now included in analyzeSentiment)
        // This saves 1 API call per item!
        chunkResults.forEach((result) => {
          allThemes.push(result.theme || 'Other');
        });
      } catch (chunkError) {
        console.error(`Error processing chunk ${Math.floor(chunkStart / CHUNK_SIZE) + 1}:`, chunkError);
        // Add default values for failed chunk
        chunk.forEach(() => {
          allResults.push({
            sentiment: 'neutral' as const,
            score: 0,
            confidence: 0,
            emotion: 'neutral',
            urgency: 1,
            reasoning: `Error: ${chunkError instanceof Error ? chunkError.message : 'Unknown error'}`,
          });
          allThemes.push('Other');
        });
      }
    }
    
    const results = allResults;
    const themes = allThemes;
    console.log(`Successfully analyzed ${results.length} items and ${themes.length} themes`);
    
    // Store feedback and analysis results in database
    await ensureDatabaseInitialized(env);
    try {
      await storeFeedbackBatch(itemsToProcess, env);
      await storeAnalysisResultsBatch(itemsToProcess, results, env);
      console.log('Stored feedback and analysis results in database');
    } catch (dbError) {
      console.error('Error storing in database (continuing anyway):', dbError);
      // Continue even if database storage fails
    }
    
    // Return feedback items with sentiment analysis and themes in frontend format
    // Note: Only return processed items (may be less than total if over limit)
    const analyzedFeedback = itemsToProcess.map((feedback, index) => {
      const sentiment = results[index];
      const theme = themes[index] || 'Other';
      return {
        id: feedback.id,
        source: feedback.source as 'github' | 'gmail' | 'discord' | 'twitter',
        content: feedback.content,
        sentiment: sentiment.sentiment,
        sentimentScore: sentiment.score,
        author: feedback.author || 'Unknown',
        timestamp: feedback.timestamp,
        theme: theme, // Use AI-classified theme
        // Additional sentiment analysis fields
        emotion: sentiment.emotion,
        urgency: sentiment.urgency,
        confidence: sentiment.confidence,
        reasoning: sentiment.reasoning,
      };
    });
    
    return c.json(analyzedFeedback);
  } catch (error) {
    console.error('Error in batch analysis:', error);
    return c.json({ 
      error: 'Failed to analyze feedback batch', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Get all feedback with analysis from database
app.get('/api/feedback', async (c) => {
  try {
    await ensureDatabaseInitialized(c.env);
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');
    
    const feedback = await getFeedbackWithAnalysis(limit, offset, c.env);
    
    return c.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return c.json({ 
      error: 'Failed to fetch feedback', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Get sentiment statistics
app.get('/api/stats', async (c) => {
  try {
    await ensureDatabaseInitialized(c.env);
    const stats = await getSentimentStats(c.env);
    return c.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ 
      error: 'Failed to fetch stats', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Get analysis results endpoint
app.get('/api/results/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const env = c.env;
    
    // Find feedback by ID
    const feedback = mockFeedbackData.find(f => f.id === id);
    
    if (!feedback) {
      return c.json({ error: 'Feedback not found' }, 404);
    }
    
    // Analyze sentiment
    const sentiment = await analyzeSentiment(feedback, env);
    
    return c.json({
      id: feedback.id,
      feedback: {
        id: feedback.id,
        source: feedback.source,
        content: feedback.content,
        author: feedback.author,
        timestamp: feedback.timestamp,
        metadata: feedback.metadata,
      },
      sentiment,
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    return c.json({ 
      error: 'Failed to fetch result', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

export default app;
