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

export const feedbackData: FeedbackItem[] = [
  // GitHub Issues - Mixed
  { id: '1', source: 'github', content: 'API returns 504 timeout on /upload endpoint with files >50MB. This is blocking our production deployment.', author: 'devops-mike', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: '2', source: 'github', content: 'Memory leak in dashboard when leaving tab open >1 hour. Chrome shows 2GB+ usage after extended use.', author: 'debug-queen', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '3', source: 'github', content: 'Request: Add TypeScript support to Workers SDK. Would be helpful to have better intellisense and type safety.', author: 'ts-enthusiast', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) },
  { id: '4', source: 'github', content: 'Dark mode breaks chart visibility - all charts appear white on white background', author: 'nightowl-dev', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: '5', source: 'github', content: 'The new R2 integration is incredibly smooth! Migrated from S3 in just 2 hours.', author: 'cloud-migrator', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) },
  { id: '6', source: 'github', content: 'Suggestion: Add bulk operations support for KV namespace. Would help with deleting large numbers of keys efficiently.', author: 'kv-power-user', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) },
  { id: '7', source: 'github', content: 'Workers AI inference is blazing fast! 50ms average response time for sentiment analysis.', author: 'ai-builder', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10) },
  { id: '8', source: 'github', content: 'Getting random 503 errors on Pages deployment - intermittent issue affecting CI/CD pipeline', author: 'ci-cd-expert', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12) },
  
  // Gmail Feedback
  { id: '9', source: 'gmail', content: 'Your customer support is phenomenal! Issue resolved in 10 minutes. Sarah was incredibly helpful.', author: 'happy-customer@company.com', timestamp: new Date(Date.now() - 1000 * 60 * 45) },
  { id: '10', source: 'gmail', content: 'Billing dashboard is confusing, cant find invoice download button anywhere. Very frustrating experience.', author: 'finance-team@startup.io', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) },
  { id: '11', source: 'gmail', content: 'Love the new analytics feature, exactly what we needed! The real-time insights are game-changing.', author: 'data-team@enterprise.com', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7) },
  { id: '12', source: 'gmail', content: 'Our enterprise account renewal process was seamless. Thank you for the smooth experience!', author: 'procurement@bigcorp.com', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 9) },
  { id: '13', source: 'gmail', content: 'Request: Need clarification on usage-based billing calculation. Can you add more details to the documentation?', author: 'billing@techfirm.co', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 11) },
  { id: '14', source: 'gmail', content: 'Request: Invoice emails are going to spam folder. Can you add SPF/DKIM verification to your sending domain?', author: 'it-admin@company.net', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14) },
  { id: '15', source: 'gmail', content: 'The mobile dashboard experience needs improvement. Hard to navigate on smaller screens.', author: 'mobile-user@agency.io', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16) },
  
  // Discord Feedback
  { id: '16', source: 'discord', content: 'Getting CORS errors when using Workers with R2. Anyone else experiencing this? Been stuck for hours.', author: 'frustrated_dev#4521', timestamp: new Date(Date.now() - 1000 * 60 * 20) },
  { id: '17', source: 'discord', content: 'Documentation for D1 migrations is unclear. Had to figure it out through trial and error.', author: 'db_enthusiast#8834', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
  { id: '18', source: 'discord', content: 'Feature request: bulk delete in KV storage would be helpful for cleanup tasks. Can you add this?', author: 'feature_hunter#2234', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) },
  { id: '19', source: 'discord', content: 'Just deployed my first Workers AI project. The developer experience is incredible! 🎉', author: 'ai_newbie#5567', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) },
  { id: '20', source: 'discord', content: 'Request: Can someone explain the difference between KV and D1? Would be helpful to have clearer documentation.', author: 'confused_coder#1122', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) },
  { id: '21', source: 'discord', content: 'Pages deploy times are insanely fast now! Under 30 seconds for our Next.js app.', author: 'speed_demon#9988', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10) },
  { id: '22', source: 'discord', content: 'Dark mode toggle doesn\'t persist across page refreshes. Minor but annoying bug.', author: 'darkmode_fan#3344', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12) },
  { id: '23', source: 'discord', content: 'The Workers Playground is amazing for prototyping. Saved me hours of local setup!', author: 'prototype_pro#7766', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 15) },
  
  // Twitter Feedback
  { id: '24', source: 'twitter', content: '@cloudflare your CDN is blazing fast! 🚀 Just migrated and seeing 40% improvement in TTFB', author: '@speed_enthusiast', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
  { id: '25', source: 'twitter', content: 'Workers AI sentiment analysis is game-changing for our customer feedback pipeline. Incredible accuracy!', author: '@mlops_ninja', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
];

// Themes, trends, and source data are now generated dynamically from feedback
// No hardcoded insights - all insights come from backend AI analysis

export function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
