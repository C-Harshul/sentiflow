import { ChevronDown } from 'lucide-react';
import { FeedbackItem, getTimeAgo } from '@/data/mockData';

interface FeedbackTableProps {
  feedback: FeedbackItem[];
  onRowClick: (item: FeedbackItem) => void;
}

const FeedbackTable = ({ feedback, onRowClick }: FeedbackTableProps) => {
  const sourceIcons = {
    github: '🐙',
    gmail: '📧',
    discord: '💬',
    twitter: '🐦',
  };

  const sourceColors = {
    github: 'bg-gray-100 text-gray-800',
    gmail: 'bg-red-50 text-red-700',
    discord: 'bg-indigo-50 text-indigo-700',
    twitter: 'bg-sky-50 text-sky-700',
  };

  const sentimentClasses: Record<string, string> = {
    positive: 'sentiment-positive',
    neutral: 'sentiment-neutral',
    negative: 'sentiment-negative',
  };

  const sentimentEmoji: Record<string, string> = {
    positive: '😊',
    neutral: '😐',
    negative: '😞',
  };

  return (
    <div className="bg-card rounded-lg shadow-card overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-xl font-semibold text-foreground">Latest Feedback Stream</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Feedback
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sentiment
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {feedback.map((item, index) => (
              <tr
                key={item.id}
                onClick={() => onRowClick(item)}
                className={`
                  cursor-pointer transition-all duration-200
                  ${index % 2 === 0 ? 'bg-card' : 'bg-muted/30'}
                  hover:bg-primary/5 hover:border-l-4 hover:border-l-primary
                `}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sourceColors[item.source]}`}>
                    <span>{sourceIcons[item.source]}</span>
                    <span className="capitalize">{item.source}</span>
                  </span>
                </td>
                <td className="px-6 py-4 max-w-md">
                  <p className="text-sm text-foreground truncate">
                    {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.sentiment ? (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sentimentClasses[item.sentiment]}`}>
                      <span>{sentimentEmoji[item.sentiment]}</span>
                      <span className="capitalize">{item.sentiment}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                      <span>—</span>
                      <span>Not analyzed</span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground">{item.author}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground">{getTimeAgo(item.timestamp)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackTable;
