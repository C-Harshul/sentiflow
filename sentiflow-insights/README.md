# Sentiflow Insights Frontend

A modern React-based dashboard for visualizing and analyzing user feedback with AI-powered sentiment analysis. Built with React, TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

- **Interactive Dashboard**: Real-time sentiment analysis visualization
- **Feedback Management**: View and filter feedback from multiple sources (GitHub, Gmail, Discord, Twitter)
- **Theme Classification**: Automatically categorized feedback into actionable themes
- **Sentiment Charts**: Visual representation of sentiment distribution and trends
- **Source Analytics**: Breakdown of feedback by source platform
- **Real-time Sync**: Analyze feedback with AI and persist results
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running (see [Backend README](../signalflow-backend/workers-backend/README.md))

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Endpoint

The frontend automatically detects the backend URL based on environment:

- **Local Development**: `http://localhost:8787` (default)
- **Production**: `https://sentiflow-workers-backend.harshulc2001.workers.dev`

To override, create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8787
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

## 🏗️ Project Structure

```
signalflow-insights/
├── src/
│   ├── pages/                 # Page components
│   │   ├── Index.tsx          # Main dashboard page
│   │   └── NotFound.tsx       # 404 page
│   ├── components/            # React components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   │   ├── Header.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── SentimentChart.tsx
│   │   │   ├── SourceChart.tsx
│   │   │   ├── TrendChart.tsx
│   │   │   ├── FeedbackTable.tsx
│   │   │   ├── FeedbackModal.tsx
│   │   │   └── ...
│   │   └── ui/               # shadcn/ui components
│   ├── services/             # API and business logic
│   │   └── api.ts            # API client, data transformation
│   ├── data/                # Mock data
│   │   └── mockData.ts      # Initial feedback data (25 items)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── App.tsx              # Root component
├── public/                  # Static assets
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json
```

## 🎨 UI Components

### Dashboard Components

- **Header**: Navigation, sync button, last synced timestamp
- **StatCard**: Display key metrics (Total, Positive %, Negative %, Critical Issues)
- **SentimentChart**: Donut chart showing sentiment distribution
- **SourceChart**: Bar chart showing feedback by source
- **TrendChart**: Line chart showing sentiment trends over time
- **FeedbackTable**: Table view of all feedback items
- **FeedbackModal**: Detailed view of individual feedback
- **IssueCard**: Theme cards with impact scores
- **FilterPills**: Filter themes by category
- **Toast**: Notification system for user feedback

### UI Library

Built with [shadcn/ui](https://ui.shadcn.com/) components:
- Button, Card, Table, Chart, Dialog, Toast, and more
- Fully customizable with Tailwind CSS
- Accessible and responsive by default

## 🔌 API Integration

### API Service (`src/services/api.ts`)

The frontend communicates with the backend through the API service:

#### Fetch Feedback from Database
```typescript
const feedback = await fetchFeedback();
// Returns: FeedbackItem[] with sentiment analysis
```

#### Analyze Feedback Batch
```typescript
const analyzedFeedback = await analyzeFeedbackBatch(feedbackItems);
// Sends to: POST /api/analyze/batch
// Returns: Analyzed feedback with sentiment, emotion, theme
```

#### Generate Insights
```typescript
const themes = generateThemes(feedbackItems);
const trends = generateTrendData(feedbackItems);
const sources = generateSourceData(feedbackItems);
```

## 📊 Data Flow

### Initial Load
1. Component mounts → `useEffect` hook runs
2. Calls `fetchFeedback()` → `GET /api/feedback`
3. If data exists in database → Display stored feedback
4. If no data → Display hardcoded fallback data
5. Generate insights (themes, trends, sources) from feedback

### Sync/Analysis Flow
1. User clicks "Sync Data" button
2. Calls `analyzeFeedbackBatch(currentFeedback)`
3. Sends to `POST /api/analyze/batch`
4. Backend analyzes and stores in database
5. Frontend fetches from database again
6. Updates UI with analyzed feedback
7. Regenerates insights from new data

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

## 🚢 Build & Deployment

### Build for Production

```bash
npm run build
```

Outputs to `dist/` directory.

### Deploy to Cloudflare Pages

```bash
wrangler pages deploy dist --project-name=sentiflow-insights
```

### Environment Variables

For production deployment, set in Cloudflare Pages dashboard:
- `VITE_API_BASE_URL`: Backend API URL (optional, auto-detected)

## 🧪 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm test
```

### Hot Module Replacement

Vite provides instant HMR (Hot Module Replacement) for fast development:
- Changes to components update instantly
- State is preserved during updates
- Fast refresh for React components

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS for styling:
- Utility-first CSS framework
- Custom theme configuration in `tailwind.config.ts`
- Dark mode support (ready for implementation)

### Component Styling

- **shadcn/ui**: Pre-built, accessible components
- **Custom Components**: Styled with Tailwind utilities
- **Responsive Design**: Mobile-first approach

## 📱 Responsive Design

The dashboard is fully responsive:
- **Desktop**: Full layout with all charts and tables
- **Tablet**: Adjusted layout with stacked components
- **Mobile**: Optimized for smaller screens

## 🔧 Configuration

### Vite Configuration (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Tailwind Configuration (`tailwind.config.ts`)

Custom theme with:
- Color palette
- Typography settings
- Component styles
- Animation utilities

## 🐛 Troubleshooting

### "Failed to fetch" Error
- **Check**: Backend is running at configured URL
- **Verify**: CORS is configured correctly on backend
- **Test**: `curl http://localhost:8787/` from terminal

### Data Not Persisting
- **Check**: Database is connected on backend
- **Verify**: Sync completed successfully
- **Test**: Check browser console for errors

### Build Errors
- **Clear cache**: `rm -rf node_modules dist && npm install`
- **Check Node version**: Requires Node.js 18+
- **Verify dependencies**: `npm install`

### Port Already in Use
- **Change port**: Vite will auto-assign next available port
- **Kill process**: `lsof -ti:5173 | xargs kill`

## 📚 Dependencies

### Core
- `react` - UI framework
- `react-dom` - DOM rendering
- `react-router-dom` - Routing
- `vite` - Build tool and dev server

### UI & Styling
- `tailwindcss` - CSS framework
- `@radix-ui/react-*` - UI primitives (via shadcn/ui)
- `lucide-react` - Icon library
- `recharts` - Chart library

### Utilities
- `date-fns` - Date formatting
- `clsx` - Conditional class names

## 🔗 Related Documentation

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Recharts Documentation](https://recharts.org/)

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
