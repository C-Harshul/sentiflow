// API configuration
// For production (Cloudflare Pages), set VITE_API_BASE_URL in environment variables
// For local development, defaults to localhost
// Production Worker URL: https://sentiflow-workers-backend.harshulc2001.workers.dev
const getApiBaseUrl = () => {
  // If environment variable is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // In production (deployed to Pages) or on pages.dev domain, use the Worker URL
  if (import.meta.env.PROD || window.location.hostname.includes('pages.dev')) {
    return 'https://sentiflow-workers-backend.harshulc2001.workers.dev';
  }
  
  // Local development - use local backend
  return 'http://localhost:8787';
};

const API_BASE_URL = getApiBaseUrl();

export interface FeedbackItem {
  id: string;
  source: 'github' | 'gmail' | 'discord' | 'twitter';
  content: string;
  sentiment?: 'positive' | 'neutral' | 'negative'; // Optional - only set after AI analysis
  sentimentScore?: number; // Optional - only set after AI analysis
  author: string;
  timestamp: Date;
  theme?: string; // Optional - only set after AI analysis
  // Additional sentiment analysis fields (optional - only after sync)
  emotion?: string;
  urgency?: number;
  confidence?: number;
  reasoning?: string;
}

export interface Theme {
  id: string;
  name: string;
  category: 'bugs' | 'features' | 'ux' | 'performance' | 'praise';
  impactScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  trend: 'up' | 'down' | 'stable';
  mentionCount: number;
  feedbackIds: string[];
  snippet: string;
}

/**
 * Fetch all feedback items from the backend API (database)
 */
export async function fetchFeedback(): Promise<FeedbackItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback?limit=100`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch feedback: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform database format to frontend format
    return data.map((item: any) => {
      // Handle both direct format and nested analysis format
      const analysis = item.analysis || item;
      
      return {
        id: item.id,
        source: item.source,
        content: item.content,
        author: item.author || 'Unknown',
        timestamp: new Date(item.timestamp),
        sentiment: analysis.sentiment,
        sentimentScore: analysis.score,
        theme: analysis.theme,
        emotion: analysis.emotion,
        urgency: analysis.urgency,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
      };
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
}

/**
 * Analyze a single feedback item
 */
export async function analyzeFeedback(content: string, source: string = 'other'): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        source,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to analyze feedback: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    throw error;
  }
}

/**
 * Analyze multiple feedback items via batch endpoint
 * Sends feedback items to backend for AI analysis
 */
export async function analyzeFeedbackBatch(feedbackItems: FeedbackItem[]): Promise<FeedbackItem[]> {
  try {
    // Convert FeedbackItem to format expected by backend
    const feedbackForBackend = feedbackItems.map(item => ({
      id: item.id,
      source: item.source,
      content: item.content,
      author: item.author,
      timestamp: item.timestamp.toISOString(),
      theme: item.theme,
    }));

    const url = `${API_BASE_URL}/api/analyze/batch`;
    console.log(`Sending ${feedbackForBackend.length} items to ${url}`);
    
    // Test if backend is reachable first
    try {
      const healthCheck = await fetch(`${API_BASE_URL}/`, { method: 'GET' });
      if (!healthCheck.ok) {
        throw new Error(`Backend health check failed: ${healthCheck.status} ${healthCheck.statusText}`);
      }
      console.log('Backend health check passed');
    } catch (healthError) {
      console.error('Backend not reachable:', healthError);
      // Provide more helpful error message
      if (API_BASE_URL.includes('localhost')) {
        throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Make sure the backend server is running locally, or set VITE_API_BASE_URL to your Cloudflare Worker URL.`);
      } else {
        throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Please check if the Worker is deployed and the URL is correct.`);
      }
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feedback: feedbackForBackend,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to analyze feedback batch: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.details || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      console.error('Backend error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // Log the response for debugging
    console.log('Backend response received:', data.length, 'items');
    if (data.length > 0) {
      console.log('Sample item fields:', Object.keys(data[0]));
      console.log('Sample item:', data[0]);
    }
    
    // Transform timestamp strings to Date objects and ensure all fields are present
    return data.map((item: any) => {
      const transformed = {
        id: item.id,
        source: item.source,
        content: item.content,
        author: item.author || 'Unknown',
        timestamp: new Date(item.timestamp),
        // Sentiment analysis fields
        sentiment: item.sentiment,
        sentimentScore: item.sentimentScore,
        theme: item.theme,
        emotion: item.emotion,
        urgency: item.urgency,
        confidence: item.confidence,
        reasoning: item.reasoning,
      };
      
      // Log if any expected fields are missing
      const expectedFields = ['id', 'source', 'content', 'sentiment', 'sentimentScore', 'theme', 'emotion', 'urgency', 'confidence', 'reasoning'];
      const missingFields = expectedFields.filter(field => transformed[field as keyof typeof transformed] === undefined);
      if (missingFields.length > 0) {
        console.warn('Missing fields in backend response:', missingFields);
      }
      
      return transformed;
    });
  } catch (error) {
    console.error('Error analyzing feedback batch:', error);
    // Provide more helpful error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Cannot connect to backend at ${API_BASE_URL}. Make sure the backend is running on port 8787.`);
    }
    throw error;
  }
}

/**
 * Generate themes from feedback items (client-side clustering)
 */
export function generateThemes(feedbackItems: FeedbackItem[]): Theme[] {
  // Group feedback by theme
  const themeMap = new Map<string, FeedbackItem[]>();
  
  feedbackItems.forEach((item) => {
    const themeName = item.theme || 'Uncategorized';
    if (!themeMap.has(themeName)) {
      themeMap.set(themeName, []);
    }
    themeMap.get(themeName)!.push(item);
  });
  
  // Convert to Theme objects
  const themes: Theme[] = [];
  let themeId = 1;
  
  themeMap.forEach((items, themeName) => {
    const sentimentCounts = {
      positive: items.filter((i) => i.sentiment === 'positive').length,
      neutral: items.filter((i) => i.sentiment === 'neutral').length,
      negative: items.filter((i) => i.sentiment === 'negative').length,
    };
    
    const dominantSentiment = 
      sentimentCounts.negative > sentimentCounts.positive && sentimentCounts.negative > sentimentCounts.neutral
        ? 'negative'
        : sentimentCounts.positive > sentimentCounts.neutral
        ? 'positive'
        : 'neutral';
    
    // Determine category first (needed for impact calculation)
    let category: Theme['category'] = 'ux';
    const themeNameLower = themeName.toLowerCase();
    if (themeNameLower.includes('bug') || themeNameLower.includes('error') || themeNameLower.includes('crash')) {
      category = 'bugs';
    } else if (themeNameLower.includes('feature') || themeNameLower.includes('request')) {
      category = 'features';
    } else if (themeNameLower.includes('performance') || themeNameLower.includes('speed')) {
      category = 'performance';
    } else if (themeNameLower.includes('praise') || themeNameLower.includes('great')) {
      category = 'praise';
    }
    
    // Calculate impact score based on urgency, sentiment, and category
    const avgUrgency = items.reduce((sum, item) => sum + (item.urgency || 1), 0) / items.length;
    let baseImpactScore = (items.length * 10) + (avgUrgency * 5) + (sentimentCounts.negative * 15);
    
    // Apply multipliers for high-impact categories
    let impactMultiplier = 1.0;
    if (category === 'bugs') {
      // Bugs are 2x more impactful
      impactMultiplier = 2.0;
    } else if (themeNameLower.includes('authentication') || themeNameLower.includes('auth') || themeNameLower.includes('login') || themeNameLower.includes('security')) {
      // Authentication/security issues are 2.5x more impactful
      impactMultiplier = 2.5;
    } else if (themeNameLower.includes('api performance') || themeNameLower.includes('timeout') || themeNameLower.includes('critical')) {
      // Critical API issues are 1.5x more impactful
      impactMultiplier = 1.5;
    }
    
    const impactScore = Math.min(100, Math.round(baseImpactScore * impactMultiplier));
    
    themes.push({
      id: `t${themeId++}`,
      name: themeName,
      category,
      impactScore,
      sentiment: dominantSentiment,
      trend: 'stable', // Could be calculated based on time series
      mentionCount: items.length,
      feedbackIds: items.map((i) => i.id),
      snippet: items[0]?.content.substring(0, 100) || '',
    });
  });
  
  return themes.sort((a, b) => b.impactScore - a.impactScore);
}

/**
 * Generate trend data from feedback items
 */
export function generateTrendData(feedbackItems: FeedbackItem[]): Array<{
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}> {
  const trendData: Map<string, { positive: number; neutral: number; negative: number }> = new Map();
  
  feedbackItems.forEach((item) => {
    const date = new Date(item.timestamp);
    const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (!trendData.has(dateKey)) {
      trendData.set(dateKey, { positive: 0, neutral: 0, negative: 0 });
    }
    
    const dayData = trendData.get(dateKey)!;
    if (item.sentiment) {
      dayData[item.sentiment]++;
    }
  });
  
  return Array.from(trendData.entries()).map(([date, counts]) => ({
    date,
    ...counts,
  }));
}

/**
 * Generate source data from feedback items
 */
export function generateSourceData(feedbackItems: FeedbackItem[]): Array<{
  source: string;
  positive: number;
  neutral: number;
  negative: number;
}> {
  const sourceMap = new Map<string, { positive: number; neutral: number; negative: number }>();
  
  feedbackItems.forEach((item) => {
    const sourceName = item.source.charAt(0).toUpperCase() + item.source.slice(1);
    
    if (!sourceMap.has(sourceName)) {
      sourceMap.set(sourceName, { positive: 0, neutral: 0, negative: 0 });
    }
    
    const sourceData = sourceMap.get(sourceName)!;
    if (item.sentiment) {
      sourceData[item.sentiment]++;
    }
  });
  
  return Array.from(sourceMap.entries()).map(([source, counts]) => ({
    source,
    ...counts,
  }));
}
