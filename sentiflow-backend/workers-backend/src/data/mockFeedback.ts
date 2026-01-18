import type { Feedback } from '../types/feedback';

/**
 * Hardcoded feedback data matching the frontend structure
 * This will be processed through the sentiment analysis chain
 */
export const mockFeedbackData: Feedback[] = [
  // GitHub Issues - Mixed
  { 
    id: '1', 
    source: 'github', 
    content: 'API returns 504 timeout on /upload endpoint with files >50MB. This is blocking our production deployment.', 
    author: 'devops-mike', 
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    metadata: { theme: 'API Performance Issues' }
  },
  { 
    id: '2', 
    source: 'github', 
    content: 'Memory leak in dashboard when leaving tab open >1 hour. Chrome shows 2GB+ usage after extended use.', 
    author: 'debug-queen', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    metadata: { theme: 'API Performance Issues' }
  },
  { 
    id: '3', 
    source: 'github', 
    content: 'Add TypeScript support to Workers SDK - would love better intellisense and type safety!', 
    author: 'ts-enthusiast', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    metadata: { theme: 'TypeScript SDK Feature Request' }
  },
  { 
    id: '4', 
    source: 'github', 
    content: 'Dark mode breaks chart visibility - all charts appear white on white background', 
    author: 'nightowl-dev', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    metadata: { theme: 'Dark Mode Requests' }
  },
  { 
    id: '5', 
    source: 'github', 
    content: 'The new R2 integration is incredibly smooth! Migrated from S3 in just 2 hours.', 
    author: 'cloud-migrator', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    metadata: { theme: 'Workers AI Praise' }
  },
  { 
    id: '6', 
    source: 'github', 
    content: 'Request: Add bulk operations support for KV namespace - need to delete 100k+ keys efficiently', 
    author: 'kv-power-user', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    metadata: { theme: 'TypeScript SDK Feature Request' }
  },
  { 
    id: '7', 
    source: 'github', 
    content: 'Workers AI inference is blazing fast! 50ms average response time for sentiment analysis.', 
    author: 'ai-builder', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    metadata: { theme: 'Workers AI Praise' }
  },
  { 
    id: '8', 
    source: 'github', 
    content: 'Getting random 503 errors on Pages deployment - intermittent issue affecting CI/CD pipeline', 
    author: 'ci-cd-expert', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    metadata: { theme: 'API Performance Issues' }
  },
  
  // Gmail Feedback
  { 
    id: '9', 
    source: 'gmail', 
    content: 'Your customer support is phenomenal! Issue resolved in 10 minutes. Sarah was incredibly helpful.', 
    author: 'happy-customer@company.com', 
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    metadata: { theme: 'Customer Support Praise' }
  },
  { 
    id: '10', 
    source: 'gmail', 
    content: 'Billing dashboard is confusing, cant find invoice download button anywhere. Very frustrating experience.', 
    author: 'finance-team@startup.io', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    metadata: { theme: 'Billing UI Confusion' }
  },
  { 
    id: '11', 
    source: 'gmail', 
    content: 'Love the new analytics feature, exactly what we needed! The real-time insights are game-changing.', 
    author: 'data-team@enterprise.com', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    metadata: { theme: 'Workers AI Praise' }
  },
  { 
    id: '12', 
    source: 'gmail', 
    content: 'Our enterprise account renewal process was seamless. Thank you for the smooth experience!', 
    author: 'procurement@bigcorp.com', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    metadata: { theme: 'Customer Support Praise' }
  },
  { 
    id: '13', 
    source: 'gmail', 
    content: 'Need clarification on usage-based billing calculation. The documentation is not clear on this.', 
    author: 'billing@techfirm.co', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
    metadata: { theme: 'Documentation Gaps' }
  },
  { 
    id: '14', 
    source: 'gmail', 
    content: 'Invoice emails are going to spam folder. Can you add SPF/DKIM verification to your sending domain?', 
    author: 'it-admin@company.net', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    metadata: { theme: 'Billing UI Confusion' }
  },
  { 
    id: '15', 
    source: 'gmail', 
    content: 'The mobile dashboard experience needs improvement. Hard to navigate on smaller screens.', 
    author: 'mobile-user@agency.io', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    metadata: { theme: 'Mobile App Bugs' }
  },
  
  // Discord Feedback
  { 
    id: '16', 
    source: 'discord', 
    content: 'Getting CORS errors when using Workers with R2. Anyone else experiencing this? Been stuck for hours.', 
    author: 'frustrated_dev#4521', 
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    metadata: { theme: 'API Performance Issues' }
  },
  { 
    id: '17', 
    source: 'discord', 
    content: 'Documentation for D1 migrations is unclear. Had to figure it out through trial and error.', 
    author: 'db_enthusiast#8834', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    metadata: { theme: 'Documentation Gaps' }
  },
  { 
    id: '18', 
    source: 'discord', 
    content: 'Feature request: bulk delete in KV storage would be amazing for cleanup tasks!', 
    author: 'feature_hunter#2234', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    metadata: { theme: 'TypeScript SDK Feature Request' }
  },
  { 
    id: '19', 
    source: 'discord', 
    content: 'Just deployed my first Workers AI project. The developer experience is incredible! 🎉', 
    author: 'ai_newbie#5567', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    metadata: { theme: 'Workers AI Praise' }
  },
  { 
    id: '20', 
    source: 'discord', 
    content: 'Can someone explain the difference between KV and D1? Documentation could be clearer.', 
    author: 'confused_coder#1122', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    metadata: { theme: 'Documentation Gaps' }
  },
  { 
    id: '21', 
    source: 'discord', 
    content: 'Pages deploy times are insanely fast now! Under 30 seconds for our Next.js app.', 
    author: 'speed_demon#9988', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    metadata: { theme: 'Workers AI Praise' }
  },
  { 
    id: '22', 
    source: 'discord', 
    content: 'Dark mode toggle doesn\'t persist across page refreshes. Minor but annoying bug.', 
    author: 'darkmode_fan#3344', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    metadata: { theme: 'Dark Mode Requests' }
  },
  { 
    id: '23', 
    source: 'discord', 
    content: 'The Workers Playground is amazing for prototyping. Saved me hours of local setup!', 
    author: 'prototype_pro#7766', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
    metadata: { theme: 'Workers AI Praise' }
  },
  
  // Twitter Feedback
  { 
    id: '24', 
    source: 'twitter', 
    content: '@cloudflare your CDN is blazing fast! 🚀 Just migrated and seeing 40% improvement in TTFB', 
    author: '@speed_enthusiast', 
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    metadata: { theme: 'Workers AI Praise' }
  },
  { 
    id: '25', 
    source: 'twitter', 
    content: 'Workers AI sentiment analysis is game-changing for our customer feedback pipeline. Incredible accuracy!', 
    author: '@mlops_ninja', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    metadata: { theme: 'Workers AI Praise' }
  },
  { 
    id: '26', 
    source: 'twitter', 
    content: 'Struggling with @cloudflare billing dashboard. Why is it so hard to download a simple invoice? 😤', 
    author: '@accounting_woes', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    metadata: { theme: 'Billing UI Confusion' }
  },
  { 
    id: '27', 
    source: 'twitter', 
    content: 'Just discovered @cloudflare Workers - mind blown 🤯 Deployed a global API in 5 minutes!', 
    author: '@serverless_stan', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    metadata: { theme: 'Workers AI Praise' }
  },
  { 
    id: '28', 
    source: 'twitter', 
    content: 'TypeScript support in Workers SDK when? 🙏 Would love proper types for all the APIs', 
    author: '@typescript_lover', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    metadata: { theme: 'TypeScript SDK Feature Request' }
  },
  { 
    id: '29', 
    source: 'twitter', 
    content: '@cloudflare support team is absolutely stellar! Resolved my zone transfer issue in under an hour.', 
    author: '@enterprise_it', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
    metadata: { theme: 'Customer Support Praise' }
  },
  { 
    id: '30', 
    source: 'twitter', 
    content: 'Mobile dashboard on @cloudflare is rough. Can barely read the graphs on my phone 📱', 
    author: '@mobile_first', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString(),
    metadata: { theme: 'Mobile App Bugs' }
  },
];
