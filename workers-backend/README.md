# Sentiflow Workers Backend

A Cloudflare Workers backend API for AI-powered feedback analysis using LangChain and Cloudflare Workers AI. Processes user feedback from multiple sources, analyzes sentiment, detects emotions, classifies themes, and stores results in Cloudflare D1 database.

## 🚀 Features

- **Sentiment Analysis**: Multi-step AI pipeline for accurate sentiment classification (positive/negative/neutral)
- **Emotion Detection**: Identifies user emotions (happy, frustrated, excited, confused, angry, neutral)
- **Theme Classification**: Automatically categorizes feedback into 14 predefined themes
- **Database Persistence**: Stores feedback and analysis results in Cloudflare D1 (SQLite)
- **Batch Processing**: Efficiently processes up to 25 feedback items per request
- **Edge Computing**: Runs on Cloudflare's global edge network for low latency
- **REST API**: Clean, RESTful API design with Hono framework

## 📋 Prerequisites

- Node.js 18+ and npm
- Cloudflare account with Workers AI enabled
- Cloudflare Account ID and API Token
- Wrangler CLI installed globally: `npm install -g wrangler`

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Cloudflare Credentials

Edit `wrangler.toml` and add your Cloudflare credentials:

```toml
[vars]
ENVIRONMENT = "development"
CLOUDFLARE_ACCOUNT_ID = "your-account-id-here"
CLOUDFLARE_API_TOKEN = "your-api-token-here"
```

**Getting Your Credentials:**

1. **Account ID**: Visit [Cloudflare Dashboard](https://dash.cloudflare.com) → Right sidebar
2. **API Token**: 
   - Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Create token with "Edit Cloudflare Workers" template
   - Ensure it has `Workers AI:Edit` and `Workers AI:Read` permissions

See `CLOUDFLARE_SETUP.md` for detailed instructions.

### 3. Create D1 Database

```bash
wrangler d1 create sentiflow-db
```

This will output a database ID. Update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "sentiflow-db"
database_id = "your-database-id-here"
```

### 4. Run Database Migrations

**Local:**
```bash
wrangler d1 execute sentiflow-db --file=./migrations/0001_initial_schema.sql
```

**Remote (Production):**
```bash
wrangler d1 execute sentiflow-db --remote --file=./migrations/0001_initial_schema.sql
```

## 🏃 Development

### Start Local Development Server

```bash
npm run dev
# or
wrangler dev
```

The server will start at `http://localhost:8787`

### Test the API

```bash
# Health check
curl http://localhost:8787/

# Get all feedback from database
curl http://localhost:8787/api/feedback

# Get sentiment statistics
curl http://localhost:8787/api/stats
```

## 📡 API Endpoints

### Health Check
```
GET /
```
Returns API status and database connection info.

**Response:**
```json
{
  "message": "Sentiflow Workers Backend API",
  "status": "ok",
  "database": "connected"
}
```

### Get All Feedback
```
GET /api/feedback?limit=100&offset=0
```
Retrieves all feedback items with their analysis results from the database.

**Query Parameters:**
- `limit` (optional): Number of items to return (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": "1",
    "source": "github",
    "content": "This is amazing!",
    "author": "user123",
    "timestamp": "2024-01-17T12:00:00Z",
    "sentiment": "positive",
    "sentimentScore": 0.95,
    "theme": "Product Praise",
    "emotion": "happy",
    "urgency": 1,
    "confidence": 0.95,
    "reasoning": "Sentiment analysis detected positive sentiment..."
  }
]
```

### Get Sentiment Statistics
```
GET /api/stats
```
Returns aggregated sentiment statistics from the database.

**Response:**
```json
{
  "total": 25,
  "positive": 12,
  "negative": 8,
  "neutral": 5
}
```

### Analyze Single Feedback
```
POST /api/analyze
```
Analyzes a single feedback item and returns sentiment analysis.

**Request Body:**
```json
{
  "content": "This feature is broken!",
  "source": "github",
  "author": "user123",
  "timestamp": "2024-01-17T12:00:00Z"
}
```

**Response:**
```json
{
  "feedback": {
    "id": "generated-id",
    "source": "github",
    "content": "This feature is broken!",
    "author": "user123",
    "timestamp": "2024-01-17T12:00:00Z"
  },
  "sentiment": {
    "sentiment": "negative",
    "score": -0.95,
    "confidence": 0.95,
    "emotion": "frustrated",
    "urgency": 1,
    "theme": "Other",
    "reasoning": "..."
  }
}
```

### Analyze Batch of Feedback
```
POST /api/analyze/batch
```
Analyzes multiple feedback items (up to 25) and stores results in database.

**Request Body:**
```json
{
  "feedback": [
    {
      "id": "1",
      "source": "github",
      "content": "This is amazing!",
      "author": "user123",
      "timestamp": "2024-01-17T12:00:00Z"
    },
    {
      "id": "2",
      "source": "gmail",
      "content": "Feature request: Add dark mode",
      "author": "user456",
      "timestamp": "2024-01-17T13:00:00Z"
    }
  ]
}
```

**Response:**
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
    "reasoning": "..."
  },
  {
    "id": "2",
    "source": "gmail",
    "content": "Feature request: Add dark mode",
    "sentiment": "neutral",
    "sentimentScore": 0,
    "author": "user456",
    "timestamp": "2024-01-17T13:00:00Z",
    "theme": "Dark Mode Requests",
    "emotion": "neutral",
    "urgency": 1,
    "confidence": 0.85,
    "reasoning": "..."
  }
]
```

**Note:** Maximum 25 items per request due to Cloudflare Workers subrequest limits (50 subrequests per request, 2 API calls per item).

## 🧠 AI Models Used

### Sentiment Classification
- **Model**: `@cf/huggingface/distilbert-sst-2-int8`
- **Purpose**: Base sentiment classification (POSITIVE/NEGATIVE)
- **Input**: Text content
- **Output**: Sentiment scores and labels

### Emotion & Theme Detection
- **Model**: `@cf/meta/llama-3.1-8b-instruct`
- **Purpose**: Combined emotion detection and theme classification
- **Input**: Text content with classification prompt
- **Output**: Emotion (happy, frustrated, etc.) and theme category

## 🗄️ Database Schema

### feedback table
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

### analysis_results table
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

## 📁 Project Structure

```
workers-backend/
├── src/
│   ├── index.ts              # Main entry point, API routes
│   ├── chains/               # LangChain processing chains
│   │   ├── sentimentChain.ts # Sentiment analysis pipeline
│   │   ├── clusteringChain.ts
│   │   ├── summaryChain.ts
│   │   └── actionItemsChain.ts
│   ├── utils/                # Utility functions
│   │   ├── database.ts       # D1 database operations
│   │   ├── cloudflareAI.ts   # Cloudflare AI REST API client
│   │   ├── embeddings.ts
│   │   └── prompts.ts
│   ├── types/                # TypeScript definitions
│   │   ├── feedback.ts
│   │   └── env.ts
│   └── data/                 # Mock data
│       ├── mockFeedback.ts
│       ├── mockGithub.ts
│       └── mockGmail.ts
├── migrations/               # Database migrations
│   └── 0001_initial_schema.sql
├── wrangler.toml             # Cloudflare Workers configuration
├── package.json
└── tsconfig.json
```

## 🚢 Deployment

### Deploy to Cloudflare Workers

```bash
npm run deploy
# or
wrangler deploy
```

### Deploy Database Migrations

```bash
wrangler d1 execute sentiflow-db --remote --file=./migrations/0001_initial_schema.sql
```

### Environment Configuration

For production, update `wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "production"
CLOUDFLARE_ACCOUNT_ID = "your-account-id"
CLOUDFLARE_API_TOKEN = "your-api-token"
```

## ⚙️ Configuration

### wrangler.toml

```toml
name = "sentiflow-workers-backend"
main = "src/index.ts"
compatibility_date = "2024-11-01"

# Workers AI binding
[ai]
binding = "AI"

# D1 database binding
[[d1_databases]]
binding = "DB"
database_name = "sentiflow-db"
database_id = "your-database-id"

# Environment variables
[vars]
ENVIRONMENT = "production"
CLOUDFLARE_ACCOUNT_ID = "your-account-id"
CLOUDFLARE_API_TOKEN = "your-api-token"
```

## 🔒 CORS Configuration

The backend includes CORS middleware that allows requests from:
- Local development: `http://localhost:8080`
- All Cloudflare Pages deployments
- Custom subdomain: `https://sentiflow-insights.pages.dev`

To add a new frontend URL, update the `allowedOrigins` array in `src/index.ts`.

## 📊 Performance Considerations

### Subrequest Limits
- **Free Tier**: 50 subrequests per request
- **Paid Tier**: 1000 subrequests per request
- **Current Strategy**: Process max 25 items per batch (2 API calls per item = 50 subrequests)

### Execution Time
- **Free Tier**: 30 seconds max execution time
- **Current Processing**: Sequential chunks of 10 items to avoid timeouts

### Database Operations
- Uses batch inserts for efficient storage
- Indexes on frequently queried fields
- Foreign key constraints for data integrity

## 🐛 Troubleshooting

### "Too many subrequests" Error
- **Cause**: Processing more than 50 subrequests in one request
- **Solution**: Reduce batch size or upgrade to paid tier

### Database Connection Issues
- **Check**: Database binding in `wrangler.toml`
- **Verify**: Database exists: `wrangler d1 list`
- **Test**: `wrangler d1 execute sentiflow-db --command "SELECT 1"`

### AI API Errors
- **Check**: Credentials in `wrangler.toml`
- **Verify**: API token has Workers AI permissions
- **Test**: Check Cloudflare dashboard for API usage

### CORS Errors
- **Check**: Frontend URL is in `allowedOrigins` array
- **Verify**: CORS middleware is applied before routes
- **Test**: Check browser console for CORS error details

## 📚 Dependencies

### Core
- `hono` - Fast web framework
- `@langchain/core` - LangChain core functionality
- `@cloudflare/workers-types` - TypeScript types

### Development
- `typescript` - Type checking
- `wrangler` - Cloudflare Workers CLI
- `@types/node` - Node.js types

## 🔗 Related Documentation

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare Workers AI Docs](https://developers.cloudflare.com/workers-ai/)
- [LangChain Docs](https://js.langchain.com/)
- [Hono Docs](https://hono.dev/)

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📧 Support

For issues and questions, please open an issue on the repository.
