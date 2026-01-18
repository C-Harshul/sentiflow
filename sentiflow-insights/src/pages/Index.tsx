import { useState, useMemo, useCallback, useEffect } from 'react';
import { MessageSquare, TrendingUp, AlertTriangle, Flame, X } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import StatCard from '@/components/dashboard/StatCard';
import SentimentChart from '@/components/dashboard/SentimentChart';
import SourceChart from '@/components/dashboard/SourceChart';
import TrendChart from '@/components/dashboard/TrendChart';
import FilterPills from '@/components/dashboard/FilterPills';
import IssueCard from '@/components/dashboard/IssueCard';
import FeedbackTable from '@/components/dashboard/FeedbackTable';
import FeedbackModal from '@/components/dashboard/FeedbackModal';
import Toast from '@/components/dashboard/Toast';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import { 
  generateThemes, 
  generateTrendData, 
  generateSourceData,
  type Theme, 
  type FeedbackItem 
} from '@/services/api';
import { feedbackData as fallbackData } from '@/data/mockData';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState('Never');
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('impact');
  // Initialize with hardcoded feedback only (no insights)
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>(fallbackData);
  const [themesData, setThemesData] = useState<Theme[]>([]);
  const [trendData, setTrendData] = useState<Array<{ date: string; positive: number; neutral: number; negative: number }>>([]);
  const [sourceData, setSourceData] = useState<Array<{ source: string; positive: number; neutral: number; negative: number }>>([]);

  // Load feedback from database on mount
  useEffect(() => {
    const loadFeedbackFromDatabase = async () => {
      try {
        setIsLoading(true);
        // Try to fetch from database first
        const { fetchFeedback } = await import('@/services/api');
        const storedFeedback = await fetchFeedback();
        
        if (storedFeedback && storedFeedback.length > 0) {
          // Use stored feedback from database
          setFeedbackData(storedFeedback);
          
          // Generate insights from stored data
          const themes = generateThemes(storedFeedback);
          setThemesData(themes);
          
          const trends = generateTrendData(storedFeedback);
          setTrendData(trends);
          
          const sources = generateSourceData(storedFeedback);
          setSourceData(sources);
          
          setLastSynced('Loaded from database');
        } else {
          // No data in database, use hardcoded fallback
          setFeedbackData(fallbackData);
          setLastSynced('Never');
        }
      } catch (error) {
        console.error('Error loading feedback from database:', error);
        // Fallback to hardcoded data if database fetch fails
        setFeedbackData(fallbackData);
        setLastSynced('Never');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeedbackFromDatabase();
  }, []);

  // Analyze current feedback items via backend API (only called on sync)
  const analyzeCurrentFeedback = useCallback(async (currentFeedback: FeedbackItem[]) => {
    try {
      // Import analyzeFeedbackBatch
      const { analyzeFeedbackBatch } = await import('@/services/api');
      
      // Send current feedback items to backend for AI analysis
      // This will also store them in the database
      const analyzedFeedback = await analyzeFeedbackBatch(currentFeedback);
      
      // After analysis, fetch from database to ensure we have persisted data
      const { fetchFeedback } = await import('@/services/api');
      const storedFeedback = await fetchFeedback();
      
      // Use stored feedback from database (ensures persistence)
      const finalFeedback = storedFeedback.length > 0 ? storedFeedback : analyzedFeedback;
      setFeedbackData(finalFeedback);
      
      // Generate derived data from analyzed feedback
      const themes = generateThemes(finalFeedback);
      setThemesData(themes);
      
      const trends = generateTrendData(finalFeedback);
      setTrendData(trends);
      
      const sources = generateSourceData(finalFeedback);
      setSourceData(sources);
      
      return finalFeedback.length;
    } catch (error) {
      console.error('Failed to analyze feedback:', error);
      throw error;
    }
  }, []);

  // Calculate stats dynamically from feedback data
  // Only show metrics if feedback has been analyzed (has sentiment field)
  const stats = useMemo(() => {
    const total = feedbackData.length || 0;
    
    // Check if any feedback has sentiment (meaning sync has been done)
    const hasAnalyzedFeedback = feedbackData.some((f) => f.sentiment !== undefined);
    
    if (!hasAnalyzedFeedback || total === 0) {
      return { total, positivePercent: 0, negativePercent: 0, critical: 0 };
    }
    
    // Use sentiment from feedback (will be from AI analysis after sync)
    const positive = feedbackData.filter((f) => f.sentiment === 'positive').length;
    const negative = feedbackData.filter((f) => f.sentiment === 'negative').length;
    // Critical issues based on urgency from AI analysis (if available)
    const critical = feedbackData.filter((f) => f.urgency && f.urgency >= 8 && f.sentiment === 'negative').length;

    return {
      total,
      positivePercent: Math.round((positive / total) * 100),
      negativePercent: Math.round((negative / total) * 100),
      critical,
    };
  }, [feedbackData]);

  // Sentiment data for chart - dynamically calculated from feedback
  // Only calculate if feedback has been analyzed
  const sentimentData = useMemo(() => {
    const hasAnalyzedFeedback = feedbackData.some((f) => f.sentiment !== undefined);
    if (!hasAnalyzedFeedback) {
      return { positive: 0, neutral: 0, negative: 0 };
    }
    return {
      positive: feedbackData.filter((f) => f.sentiment === 'positive').length,
      neutral: feedbackData.filter((f) => f.sentiment === 'neutral').length,
      negative: feedbackData.filter((f) => f.sentiment === 'negative').length,
    };
  }, [feedbackData]);

  // Filter and sort themes
  const filteredThemes = useMemo(() => {
    let filtered = themesData;
    
    if (activeFilter !== 'All') {
      const categoryMap: Record<string, string> = {
        'Bugs': 'bugs',
        'Features': 'features',
        'UX': 'ux',
        'Performance': 'performance',
      };
      filtered = themesData.filter((t) => t.category === categoryMap[activeFilter]);
    }

    return filtered.sort((a, b) => b.impactScore - a.impactScore);
  }, [activeFilter, themesData]);

  // Sync handler - sends current feedback to backend for AI analysis
  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    setIsLoading(true);
    
    try {
      // Pass current feedbackData to analysis function
      const analyzedCount = await analyzeCurrentFeedback(feedbackData);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setLastSynced(timeStr);
      setToast({ 
        message: `✓ Analyzed ${analyzedCount} items with AI`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Sync error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToast({ 
        message: `Failed to analyze feedback: ${errorMessage}`, 
        type: 'error' 
      });
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [analyzeCurrentFeedback, feedbackData]);

  // Handle row click - show feedback detail
  const handleRowClick = useCallback((item: FeedbackItem) => {
    setSelectedFeedback(item);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSync={handleSync}
        isSyncing={isSyncing}
        lastSynced={lastSynced}
      />

      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Feedback"
                value={stats.total}
                icon={MessageSquare}
                iconBgColor="orange"
              />
              <StatCard
                title="Positive Sentiment"
                value={stats.positivePercent}
                suffix="%"
                icon={TrendingUp}
                iconBgColor="green"
              />
              <StatCard
                title="Negative Sentiment"
                value={stats.negativePercent}
                suffix="%"
                icon={AlertTriangle}
                iconBgColor="red"
              />
              <StatCard
                title="Critical Issues"
                value={`🔥 ${stats.critical}`}
                icon={Flame}
                iconBgColor="red"
              />
            </section>

            {/* Sentiment Analysis Section */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-6">Sentiment Analysis</h2>
              {sourceData.length > 0 || trendData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <SentimentChart data={sentimentData} />
                  {sourceData.length > 0 && <SourceChart data={sourceData} />}
                  {trendData.length > 0 && <TrendChart data={trendData} />}
                </div>
              ) : (
                <div className="bg-card rounded-lg p-8 text-center border border-border">
                  <p className="text-muted-foreground">Click "Sync" to generate AI insights and charts</p>
                </div>
              )}
            </section>

            {/* Critical Issues Section */}
            <section>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-xl font-semibold text-foreground">Critical Issues & Themes</h2>
                {themesData.length > 0 && (
                  <div className="flex items-center gap-4">
                    <FilterPills
                      options={['All', 'Bugs', 'Features', 'UX', 'Performance']}
                      activeFilter={activeFilter}
                      onFilterChange={setActiveFilter}
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="impact">Sort by: Impact</option>
                      <option value="mentions">Sort by: Mentions</option>
                      <option value="recent">Sort by: Recent</option>
                    </select>
                  </div>
                )}
              </div>
              {themesData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredThemes.map((theme) => (
                    <IssueCard
                      key={theme.id}
                      theme={theme}
                      onClick={() => setSelectedTheme(theme)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-lg p-8 text-center border border-border">
                  <p className="text-muted-foreground">Click "Sync" to analyze feedback and generate themes</p>
                </div>
              )}
            </section>

            {/* Feedback Table */}
            <section>
              <FeedbackTable
                feedback={feedbackData.slice(0, 10)}
                onRowClick={handleRowClick}
              />
            </section>

            {/* Footer */}
            <footer className="text-center py-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Built with Cloudflare Workers • Pages • AI
              </p>
            </footer>
          </div>
        )}
      </main>

      {/* Modal */}
        {/* Theme Modal */}
        <FeedbackModal
          theme={selectedTheme}
          feedbackItems={feedbackData}
          onClose={() => setSelectedTheme(null)}
        />
        
        {/* Feedback Detail Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
              onClick={() => setSelectedFeedback(null)}
            />
            
            {/* Modal */}
            <div className="relative bg-card rounded-xl shadow-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Feedback Details</h2>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Source and Author */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="capitalize font-medium">{selectedFeedback.source}</span>
                  <span>•</span>
                  <span>{selectedFeedback.author}</span>
                  <span>•</span>
                  <span>{new Date(selectedFeedback.timestamp).toLocaleString()}</span>
                </div>
                
                {/* Sentiment Badge */}
                {selectedFeedback.sentiment && (
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                      selectedFeedback.sentiment === 'positive' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : selectedFeedback.sentiment === 'negative'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                      <span>{selectedFeedback.sentiment === 'positive' ? '😊' : selectedFeedback.sentiment === 'negative' ? '😞' : '😐'}</span>
                      <span className="capitalize">{selectedFeedback.sentiment}</span>
                    </span>
                  </div>
                )}
                
                {/* Feedback Content */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-foreground whitespace-pre-wrap">{selectedFeedback.content}</p>
                </div>
                
                {/* Additional Info */}
                {selectedFeedback.theme && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Theme:</span> {selectedFeedback.theme}
                  </div>
                )}
                
                {selectedFeedback.emotion && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Emotion:</span> <span className="capitalize">{selectedFeedback.emotion}</span>
                  </div>
                )}
                
                {selectedFeedback.urgency !== undefined && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Urgency:</span> {selectedFeedback.urgency}/10
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Index;
