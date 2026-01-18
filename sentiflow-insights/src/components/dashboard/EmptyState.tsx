import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onSync: () => void;
}

const EmptyState = ({ onSync }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Inbox className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No feedback yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Click Sync Data to fetch feedback from your connected sources like GitHub, Gmail, Discord, and Twitter.
      </p>
      <Button onClick={onSync} className="bg-primary text-primary-foreground hover:bg-primary/90">
        Get Started
      </Button>
    </div>
  );
};

export default EmptyState;
