import { X, Flag, CheckCircle, Download, Lightbulb } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Theme, FeedbackItem } from '@/services/api';
import { feedbackData as fallbackData } from '@/data/mockData';

interface FeedbackModalProps {
  theme: Theme | null;
  feedbackItems?: FeedbackItem[];
  onClose: () => void;
}

const FeedbackModal = ({ theme, feedbackItems, onClose }: FeedbackModalProps) => {
  if (!theme) return null;

  const allFeedback = feedbackItems || fallbackData;
  const relatedFeedback = allFeedback.filter((f) => f.theme === theme.name);

  const sentimentBreakdown = {
    positive: relatedFeedback.filter((f) => f.sentiment === 'positive').length,
    neutral: relatedFeedback.filter((f) => f.sentiment === 'neutral').length,
    negative: relatedFeedback.filter((f) => f.sentiment === 'negative').length,
  };

  const chartData = [
    { name: 'Positive', value: sentimentBreakdown.positive, color: 'hsl(160, 84%, 39%)' },
    { name: 'Neutral', value: sentimentBreakdown.neutral, color: 'hsl(38, 92%, 50%)' },
    { name: 'Negative', value: sentimentBreakdown.negative, color: 'hsl(0, 84%, 60%)' },
  ];

  const keywords = ['API', 'timeout', 'performance', 'upload', 'error', 'fix'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-xl shadow-modal max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{theme.name}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* AI Summary */}
          <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">AI Summary</h4>
            <p className="text-sm text-muted-foreground">
              This theme represents recurring feedback about {theme.name.toLowerCase()}. 
              Users are primarily experiencing issues with API timeouts and performance degradation 
              under load. The trend is {theme.trend === 'up' ? 'increasing' : theme.trend === 'down' ? 'decreasing' : 'stable'}, 
              suggesting {theme.trend === 'up' ? 'this needs immediate attention' : 'the situation is being managed'}.
            </p>
          </div>

          {/* Impact Score */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">
              Impact Score: {theme.impactScore}/100
            </h4>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${theme.impactScore}%` }}
              />
            </div>
          </div>

          {/* Keywords */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Sentiment Breakdown</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="bg-info/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-info" />
                <h4 className="font-semibold text-foreground">AI Recommendation</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Prioritize fixing API timeout handling in the upload service. Consider implementing 
                chunked uploads for large files and adding proper timeout retry logic. This addresses 
                {theme.mentionCount} user complaints and would significantly improve satisfaction.
              </p>
            </div>
          </div>

          {/* Related Feedback */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Related Feedback ({relatedFeedback.length})</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {relatedFeedback.slice(0, 5).map((item) => {
                const sentimentClasses: Record<string, string> = {
                  positive: 'bg-green-100 text-green-700 border-green-200',
                  neutral: 'bg-orange-100 text-orange-700 border-orange-200',
                  negative: 'bg-red-100 text-red-700 border-red-200',
                };
                
                const sentimentEmoji: Record<string, string> = {
                  positive: '😊',
                  neutral: '😐',
                  negative: '😞',
                };
                
                return (
                  <div key={item.id} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-medium text-muted-foreground capitalize">
                        {item.source}
                      </span>
                      <span className="text-xs text-muted-foreground">• {item.author}</span>
                      {item.sentiment && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${sentimentClasses[item.sentiment]}`}>
                          <span>{sentimentEmoji[item.sentiment]}</span>
                          <span className="capitalize">{item.sentiment}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{item.content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="ghost" className="text-muted-foreground">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Resolved
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Flag className="w-4 h-4 mr-2" />
            Add to Roadmap
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
