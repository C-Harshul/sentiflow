# Sentiflow Architecture

## Overview

Sentiflow is an AI-powered feedback analysis platform that processes user feedback from multiple sources, analyzes sentiment, classifies themes, and provides actionable insights. The system is built on Cloudflare's edge computing platform for global scalability and low latency.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│                    (React + Vite + TypeScript)                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Dashboard  │  │  Feedback    │  │  Analytics   │         │
│  │   Components │  │   Table      │  │   Charts     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐         │
│  │         API Service Layer (api.ts)                │         │
│  │  - fetchFeedback()                                │         │
│  │  - analyzeFeedbackBatch()                        │         │
│  └─────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Layer (Cloudflare Worker)            │
│                    (Hono + TypeScript + LangChain)              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Endpoints (index.ts)                    │  │
│  │  - GET  /                    (Health check)              │  │
│  │  - GET  /api/feedback        (Fetch from DB)            │  │
│  │  - GET  /api/stats           (Sentiment statistics)     │  │
│  │  - POST /api/analyze         (Single analysis)          │  │
│  │  - POST /api/analyze/batch   (Batch analysis)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Processing Chains (chains/)                      │  │
│  │  - sentimentChain.ts  (Sentiment + Emotion + Theme)     │  │
│  │  - clusteringChain.ts (Feedback clustering)             │  │
│  │  - summaryChain.ts    (Summary generation)              │  │
│  │  - actionItemsChain.ts (Action item extraction)         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Database Layer (utils/database.ts)               │  │
│  │  - initDatabase()                                        │  │
│  │  - storeFeedbackBatch()                                  │  │
│  │  - storeAnalysisResultsBatch()                          │  │
│  │  - getFeedbackWithAnalysis()                            │  │
│  │  - getSentimentStats()                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ D1 Database Binding
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Data Persistence Layer                       │
│                    (Cloudflare D1 - SQLite)                     │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │   feedback table     │  │ analysis_results     │          │
│  │  - id (PK)           │  │   table              │          │
│  │  - source            │  │  - id (PK)           │          │
│  │  - content           │  │  - feedback_id (FK)  │          │
│  │  - author            │  │  - sentiment         │          │
│  │  - timestamp         │  │  - score             │          │
│  │  - metadata          │  │  - confidence        │          │
│  │  - created_at        │  │  - emotion           │          │
│  │  - updated_at        │  │  - urgency           │          │
│  └──────────────────────┘  │  - theme             │          │
│                             │  - reasoning         │          │
│                             │  - created_at        │          │
│                             └──────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API Calls
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    AI Services Layer                            │
│              (Cloudflare Workers AI)                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  @cf/huggingface/distilbert-sst-2-int8                  │  │
│  │  - Sentiment Classification (POSITIVE/NEGATIVE)          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  @cf/meta/llama-3.1-8b-instruct                          │  │
│  │  - Emotion Detection (happy, frustrated, etc.)           │  │
│  │  - Theme Classification (14 categories)                   │  │
│  │  - Combined emotion + theme detection                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  @cf/baai/bge-base-en-v1.5 (Available, not used)         │  │
│  │  - Embeddings for semantic similarity                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (signalflow-insights)

**Technology Stack:**
- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui components
- React Router for navigation

**Key Components:**
- `src/pages/Index.tsx` - Main dashboard page
- `src/services/api.ts` - API client and data transformation
- `src/components/dashboard/` - Dashboard UI components
- `src/data/mockData.ts` - Initial hardcoded feedback (25 items)

**Data Flow:**
1. On mount: Fetches from database via `GET /api/feedback`
2. On sync: Sends feedback to `POST /api/analyze/batch`
3. After analysis: Fetches from database again to ensure persistence
4. Generates insights: Themes, trends, source data from analyzed feedback

### Backend (signalflow-backend/workers-backend)

**Technology Stack:**
- Cloudflare Workers (Edge Runtime)
- Hono web framework
- TypeScript
- LangChain for AI orchestration
- D1 Database (SQLite) for persistence

**Key Files:**
- `src/index.ts` - Main entry point, API routes, CORS middleware
- `src/chains/sentimentChain.ts` - Sentiment analysis pipeline
- `src/utils/database.ts` - Database operations
- `src/utils/cloudflareAI.ts` - Cloudflare AI REST API client
- `wrangler.toml` - Cloudflare Workers configuration

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/feedback` | Get all feedback with analysis (from DB) |
| GET | `/api/stats` | Get sentiment statistics |
| POST | `/api/analyze` | Analyze single feedback item |
| POST | `/api/analyze/batch` | Analyze batch of feedback items (max 25) |

### Sentiment Analysis Pipeline

The sentiment analysis uses a multi-step LangChain pipeline:

1. **Input Parsing**: Extracts content and metadata from feedback
2. **Base Sentiment Classification**: Uses `@cf/huggingface/distilbert-sst-2-int8`
   - Returns POSITIVE/NEGATIVE scores
   - Calculates confidence and uncertainty
3. **Neutral Request Detection**: Keyword-based detection for feature requests
   - Checks for request keywords (request, add, feature, etc.)
   - Overrides sentiment to neutral if appropriate
4. **Emotion & Theme Detection**: Combined LLM call using `@cf/meta/llama-3.1-8b-instruct`
   - Detects emotion: happy, frustrated, excited, confused, angry, neutral
   - Classifies theme: 14 predefined categories
5. **Output Formatting**: Applies business logic
   - Emotion-based corrections
   - Error keyword prioritization
   - Final sentiment assignment

### Database Schema

**feedback table:**
```sql
CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  timestamp TEXT NOT NULL,
  metadata TEXT,  -- JSON string
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**analysis_results table:**
```sql
CREATE TABLE analysis_results (
  id TEXT PRIMARY KEY,
  feedback_id TEXT NOT NULL,
  sentiment TEXT NOT NULL,  -- 'positive', 'negative', 'neutral'
  score REAL NOT NULL,       -- -1.0 to 1.0
  confidence REAL NOT NULL,  -- 0.0 to 1.0
  emotion TEXT NOT NULL,
  urgency INTEGER NOT NULL DEFAULT 1,
  theme TEXT NOT NULL DEFAULT 'Other',
  reasoning TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE
);
```

### Data Flow

#### Initial Load Flow:
```
Frontend → GET /api/feedback → Database Query → Return stored feedback
```

#### Sync/Analysis Flow:
```
Frontend → POST /api/analyze/batch → 
  ├─ Process in chunks (10 items/chunk, max 25 total)
  ├─ For each item:
  │   ├─ Call distilbert (sentiment classification)
  │   └─ Call llama-3.1-8b (emotion + theme)
  ├─ Store feedback in D1
  ├─ Store analysis results in D1
  └─ Return analyzed feedback
```

#### Insight Generation:
```
Analyzed Feedback → Frontend Processing →
  ├─ generateThemes() - Groups by theme, calculates impact
  ├─ generateTrendData() - Time-series sentiment trends
  └─ generateSourceData() - Sentiment by source
```

## Deployment Architecture

### Production Deployment

**Frontend:**
- **Platform**: Cloudflare Pages
- **URL**: `https://*.sentiflow-insights.pages.dev`
- **Build**: Vite production build
- **Deploy**: `wrangler pages deploy dist`

**Backend:**
- **Platform**: Cloudflare Workers
- **URL**: `https://sentiflow-workers-backend.harshulc2001.workers.dev`
- **Runtime**: Cloudflare Edge Runtime (V8 isolates)
- **Deploy**: `wrangler deploy`

**Database:**
- **Platform**: Cloudflare D1
- **Database**: `sentiflow-db`
- **Region**: ENAM (US East)
- **Type**: SQLite (distributed)

### Local Development

**Frontend:**
- **Command**: `npm run dev`
- **URL**: `http://localhost:8080` (or auto-assigned port)
- **Hot Reload**: Enabled

**Backend:**
- **Command**: `wrangler dev`
- **URL**: `http://localhost:8787`
- **Database**: Local D1 instance (`.wrangler/state/v3/d1/`)

## Performance Optimizations

### Subrequest Management
- **Limit**: 50 subrequests per request (Cloudflare Workers free tier)
- **Strategy**: Sequential processing in chunks of 10 items
- **Max Items**: 25 items per batch request (50 subrequests = 2 per item)
- **Optimization**: Combined emotion + theme detection (saves 1 API call per item)

### Database Operations
- **Batch Inserts**: Uses D1 batch API for efficient storage
- **Indexes**: Created on frequently queried fields (source, timestamp, sentiment, theme)
- **Foreign Keys**: Cascade delete for data integrity

### Caching Strategy
- **Frontend**: React state management
- **Backend**: No caching (always fresh from database)
- **Future**: Could add KV namespace for analysis result caching

## Security

- **CORS**: Whitelist-based origin checking
- **API Keys**: Stored in `wrangler.toml` environment variables
- **Database**: Isolated per account, no public access
- **Input Validation**: Type checking and sanitization

## Scalability Considerations

### Current Limitations
- **Batch Size**: 25 items max per request (subrequest limit)
- **Execution Time**: 30 seconds max (Cloudflare Workers free tier)
- **Database Size**: D1 free tier limits apply

### Scaling Strategies
1. **Multiple Requests**: Frontend can send multiple batch requests
2. **Queue System**: Could implement Cloudflare Queues for async processing
3. **Caching**: KV namespace for frequently accessed data
4. **Upgrade Tier**: Paid Workers plan (1000 subrequests, longer execution)

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 18 + TypeScript | UI components and state management |
| Build Tool | Vite | Fast development and production builds |
| Styling | Tailwind CSS + shadcn/ui | Modern, responsive UI components |
| Backend Framework | Hono | Fast, lightweight web framework |
| Runtime | Cloudflare Workers | Edge computing platform |
| AI Orchestration | LangChain | Chain-based AI processing |
| Database | Cloudflare D1 (SQLite) | Persistent data storage |
| AI Models | Cloudflare Workers AI | Sentiment, emotion, theme detection |
| Deployment | Cloudflare Pages + Workers | Global edge deployment |

## File Structure

```
signalflow/
├── signalflow-insights/          # Frontend application
│   ├── src/
│   │   ├── pages/               # Page components
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # API client
│   │   └── data/               # Mock data
│   ├── public/                 # Static assets
│   └── package.json
│
└── signalflow-backend/
    └── workers-backend/            # Backend API
        ├── src/
        │   ├── index.ts          # Main entry, routes
        │   ├── chains/          # AI processing chains
        │   ├── utils/           # Database, AI utilities
        │   ├── types/           # TypeScript definitions
        │   └── data/            # Mock data
        ├── migrations/          # Database migrations
        └── wrangler.toml        # Cloudflare config
```

## Environment Variables

**Backend (`wrangler.toml`):**
- `ENVIRONMENT`: "production" or "development"
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account identifier
- `CLOUDFLARE_API_TOKEN`: API token for Workers AI access

**Frontend:**
- `VITE_API_BASE_URL`: Optional override for backend URL (defaults to Worker URL in production)

## API Request/Response Examples

### Batch Analysis Request
```json
POST /api/analyze/batch
{
  "feedback": [
    {
      "id": "1",
      "source": "github",
      "content": "This is amazing!",
      "author": "user123",
      "timestamp": "2024-01-17T12:00:00Z"
    }
  ]
}
```

### Batch Analysis Response
```json
[
  {
    "id": "1",
    "source": "github",
    "content": "This is amazing!",
    "sentiment": "positive",
    "sentimentScore": 0.95,
    "author": "user123",
    "timestamp": "2024-01-17T12:00:00Z",
    "theme": "Product Praise",
    "emotion": "happy",
    "urgency": 1,
    "confidence": 0.95,
    "reasoning": "Sentiment analysis detected positive sentiment..."
  }
]
```

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live feedback
2. **Advanced Analytics**: ML-based trend prediction
3. **Export Features**: CSV/PDF export of analysis
4. **User Management**: Multi-tenant support
5. **Custom Themes**: User-defined theme categories
6. **Integration APIs**: Connect to GitHub, Slack, etc. directly
