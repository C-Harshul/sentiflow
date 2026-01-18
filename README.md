# Sentiflow

> AI-powered feedback analysis platform that processes user feedback from multiple sources, analyzes sentiment, classifies themes, and provides actionable insights.

Sentiflow is a full-stack application built on Cloudflare's edge computing platform, combining a modern React frontend with a Cloudflare Workers backend powered by LangChain and Cloudflare Workers AI.

## 🚀 Features

- **Multi-Source Feedback Collection**: Aggregate feedback from GitHub, Gmail, Discord, Twitter, and more
- **AI-Powered Sentiment Analysis**: Multi-step pipeline using Cloudflare Workers AI for accurate sentiment classification (positive/negative/neutral)
- **Emotion Detection**: Identifies user emotions (happy, frustrated, excited, confused, angry, neutral)
- **Theme Classification**: Automatically categorizes feedback into 14 predefined themes
- **Interactive Dashboard**: Real-time visualization with charts, trends, and analytics
- **Database Persistence**: Stores feedback and analysis results in Cloudflare D1 (SQLite)
- **Batch Processing**: Efficiently processes up to 25 feedback items per request
- **Edge Computing**: Runs on Cloudflare's global edge network for low latency worldwide
- **Responsive Design**: Modern UI built with React, TypeScript, Tailwind CSS, and shadcn/ui

## 📋 Project Structure

```
sentiflow/
├── sentiflow-insights/      # Frontend React application
│   ├── src/
│   │   ├── pages/          # Page components (Index, NotFound)
│   │   ├── components/     # React components (dashboard, ui)
│   │   ├── services/       # API client and business logic
│   │   ├── data/           # Mock data
│   │   └── hooks/          # Custom React hooks
│   ├── public/            # Static assets
│   └── package.json
│
├── workers-backend/        # Backend Cloudflare Worker API
│   ├── src/
│   │   ├── index.ts       # Main entry point, API routes
│   │   ├── chains/        # LangChain processing chains
│   │   ├── utils/         # Database, AI utilities
│   │   ├── types/         # TypeScript definitions
│   │   └── data/          # Mock data
│   ├── migrations/        # Database migrations
│   ├── wrangler.toml      # Cloudflare Workers configuration
│   └── package.json
│
├── ARCHITECTURE.md        # Detailed architecture documentation
└── README.md             # This file
```

## 🏗️ Architecture

### System Overview

```
Frontend (React + Vite) → Backend (Cloudflare Workers) → D1 Database (SQLite)
                              ↓
                    Cloudflare Workers AI
                    - Sentiment Classification
                    - Emotion Detection
                    - Theme Classification
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 18 + TypeScript | UI components and state management |
| **Build Tool** | Vite | Fast development and production builds |
| **Styling** | Tailwind CSS + shadcn/ui | Modern, responsive UI components |
| **Backend Framework** | Hono | Fast, lightweight web framework |
| **Runtime** | Cloudflare Workers | Edge computing platform |
| **AI Orchestration** | LangChain | Chain-based AI processing |
| **Database** | Cloudflare D1 (SQLite) | Persistent data storage |
| **AI Models** | Cloudflare Workers AI | Sentiment, emotion, theme detection |
| **Deployment** | Cloudflare Pages + Workers | Global edge deployment |

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Cloudflare account** with Workers AI enabled
- **Wrangler CLI**: `npm install -g wrangler`

### 1. Clone the Repository

```bash
git clone https://github.com/C-Harshul/sentiflow.git
cd sentiflow
```

### 2. Backend Setup

```bash
cd workers-backend

# Install dependencies
npm install

# Configure Cloudflare credentials in wrangler.toml
# Add your CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN

# Create D1 database
wrangler d1 create sentiflow-db

# Update database_id in wrangler.toml

# Run database migrations
wrangler d1 execute sentiflow-db --file=./migrations/0001_initial_schema.sql

# Start development server
npm run dev
```

The backend will be available at `http://localhost:8787`

**For detailed backend setup, see [workers-backend/README.md](./workers-backend/README.md)**

### 3. Frontend Setup

```bash
cd sentiflow-insights

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173` (or next available port)

**For detailed frontend setup, see [sentiflow-insights/README.md](./sentiflow-insights/README.md)**

## 📡 API Endpoints

### Health Check
```bash
GET /
```
Returns API status and database connection info.

### Get All Feedback
```bash
GET /api/feedback?limit=100&offset=0
```
Retrieves all feedback items with their analysis results from the database.

### Get Sentiment Statistics
```bash
GET /api/stats
```
Returns aggregated sentiment statistics.

### Analyze Single Feedback
```bash
POST /api/analyze
Content-Type: application/json

{
  "content": "This feature is broken!",
  "source": "github",
  "author": "user123",
  "timestamp": "2024-01-17T12:00:00Z"
}
```

### Analyze Batch of Feedback
```bash
POST /api/analyze/batch
Content-Type: application/json

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

**Note:** Maximum 25 items per batch request due to Cloudflare Workers subrequest limits.

For detailed API documentation, see [workers-backend/README.md](./workers-backend/README.md#-api-endpoints).

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
- **Output**: Emotion (happy, frustrated, etc.) and theme category (14 predefined themes)

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

## 🚢 Deployment

### Frontend Deployment (Cloudflare Pages)

```bash
cd sentiflow-insights
npm run build
wrangler pages deploy dist --project-name=sentiflow-insights
```

### Backend Deployment (Cloudflare Workers)

```bash
cd workers-backend
npm run deploy
```

### Database Migrations (Production)

```bash
cd workers-backend
wrangler d1 execute sentiflow-db --remote --file=./migrations/0001_initial_schema.sql
```

## 📊 Data Flow

### Initial Load
1. Frontend mounts → Calls `GET /api/feedback`
2. Backend queries D1 database → Returns stored feedback
3. Frontend displays feedback with analysis results
4. Frontend generates insights (themes, trends, sources)

### Sync/Analysis Flow
1. User clicks "Sync Data" button in frontend
2. Frontend sends `POST /api/analyze/batch` with feedback items
3. Backend processes in chunks (10 items/chunk, max 25 total)
4. For each item:
   - Calls distilbert (sentiment classification)
   - Calls llama-3.1-8b (emotion + theme)
5. Backend stores feedback and analysis results in D1
6. Frontend fetches from database again
7. UI updates with analyzed feedback

## 🎯 Key Features

### Sentiment Analysis
- **Positive**: Green indicators, happy emoji
- **Negative**: Red indicators, sad emoji
- **Neutral**: Orange indicators, neutral emoji

### Theme Classification
14 predefined theme categories:
- API Performance Issues
- Authentication Issues
- Billing UI Confusion
- Customer Support Praise
- Dark Mode Requests
- Documentation Gaps
- Feature Requests
- Mobile App Bugs
- Performance Improvements
- Product Praise
- TypeScript SDK Feature Request
- Workers AI Praise
- UI/UX Improvements
- Other

### Impact Scoring
Themes are scored based on:
- Number of mentions
- Average urgency
- Negative sentiment count
- Category multipliers (bugs/auth = 2.5x, API performance = 1.5x)

## 📖 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Detailed system architecture and design decisions
- **[sentiflow-insights/README.md](./sentiflow-insights/README.md)**: Frontend documentation and setup
- **[workers-backend/README.md](./workers-backend/README.md)**: Backend API documentation and setup
- **[workers-backend/API_SETUP.md](./workers-backend/API_SETUP.md)**: API configuration guide
- **[workers-backend/CLOUDFLARE_SETUP.md](./workers-backend/CLOUDFLARE_SETUP.md)**: Cloudflare setup instructions

## 🔧 Development

### Running Tests

**Frontend:**
```bash
cd sentiflow-insights
npm test
```

**Backend:**
```bash
cd workers-backend
npm run typecheck
```

### Project Scripts

**Frontend:**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

**Backend:**
```bash
npm run dev      # Start development server
npm run deploy   # Deploy to Cloudflare Workers
npm run typecheck # Type check without building
```

## 🐛 Troubleshooting

### Backend Issues

**"Too many subrequests" Error**
- **Cause**: Processing more than 50 subrequests in one request
- **Solution**: Reduce batch size (max 25 items) or upgrade to paid tier

**Database Connection Issues**
- **Check**: Database binding in `wrangler.toml`
- **Verify**: `wrangler d1 list`
- **Test**: `wrangler d1 execute sentiflow-db --command "SELECT 1"`

**AI API Errors**
- **Check**: Credentials in `wrangler.toml`
- **Verify**: API token has Workers AI permissions

### Frontend Issues

**"Failed to fetch" Error**
- **Check**: Backend is running at configured URL
- **Verify**: CORS is configured correctly on backend
- **Test**: `curl http://localhost:8787/`

**Data Not Persisting**
- **Check**: Database is connected on backend
- **Verify**: Sync completed successfully
- **Test**: Check browser console for errors

## ⚙️ Configuration

### Environment Variables

**Backend (`wrangler.toml`):**
```toml
[vars]
ENVIRONMENT = "production"
CLOUDFLARE_ACCOUNT_ID = "your-account-id"
CLOUDFLARE_API_TOKEN = "your-api-token"
```

**Frontend:**
Optional `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8787
```

## 🔒 Security

- **CORS**: Whitelist-based origin checking
- **API Keys**: Stored in `wrangler.toml` environment variables
- **Database**: Isolated per account, no public access
- **Input Validation**: Type checking and sanitization

## 📈 Performance

### Current Limitations
- **Batch Size**: 25 items max per request (subrequest limit)
- **Execution Time**: 30 seconds max (Cloudflare Workers free tier)
- **Database Size**: D1 free tier limits apply

### Optimizations
- Sequential processing in chunks of 10 items
- Combined emotion + theme detection (saves 1 API call per item)
- Batch inserts for database operations
- Indexes on frequently queried fields

## 🔮 Future Enhancements

1. **Real-time Updates**: WebSocket support for live feedback
2. **Advanced Analytics**: ML-based trend prediction
3. **Export Features**: CSV/PDF export of analysis
4. **User Management**: Multi-tenant support
5. **Custom Themes**: User-defined theme categories
6. **Integration APIs**: Connect to GitHub, Slack, etc. directly
7. **Queue System**: Cloudflare Queues for async processing
8. **Caching**: KV namespace for frequently accessed data

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📧 Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/C-Harshul/sentiflow)
- Check the documentation in individual component README files
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system details

## 🙏 Acknowledgments

- [Cloudflare](https://www.cloudflare.com/) for the edge computing platform
- [LangChain](https://www.langchain.com/) for AI orchestration
- [React](https://react.dev/) and [Vite](https://vitejs.dev/) for the frontend
- [shadcn/ui](https://ui.shadcn.com/) for the UI component library

---

Built with ❤️ using Cloudflare Workers AI and React
