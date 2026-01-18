import { MessageSquare, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { Theme } from '@/data/mockData';

interface IssueCardProps {
  theme: Theme;
  onClick: () => void;
}

const IssueCard = ({ theme, onClick }: IssueCardProps) => {
  const severityClass = theme.impactScore >= 80 
    ? 'severity-critical' 
    : theme.impactScore >= 60 
      ? 'severity-high' 
      : 'severity-medium';

  const sentimentEmoji = {
    positive: '😊',
    neutral: '😐',
    negative: '😞',
  };

  const trendIcon = {
    up: <TrendingUp className="w-4 h-4 text-destructive" />,
    down: <TrendingDown className="w-4 h-4 text-success" />,
    stable: <Minus className="w-4 h-4 text-muted-foreground" />,
  };

  const impactColor = theme.impactScore >= 80 
    ? 'bg-destructive/10 text-destructive' 
    : theme.impactScore >= 60 
      ? 'bg-primary/10 text-primary' 
      : 'bg-warning/10 text-warning';

  return (
    <div
      onClick={onClick}
      className={`
        bg-card rounded-lg p-5 shadow-card cursor-pointer
        transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1
        ${severityClass}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-foreground truncate">{theme.name}</h4>
            <span className="text-lg">{sentimentEmoji[theme.sentiment]}</span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${impactColor}`}>
              Impact: {theme.impactScore}
            </span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span>{theme.mentionCount} mentions</span>
            </div>
            <div className="flex items-center gap-1">
              {trendIcon[theme.trend]}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{theme.snippet}</p>
        </div>

        <button className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium whitespace-nowrap group">
          View Details
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default IssueCard;
