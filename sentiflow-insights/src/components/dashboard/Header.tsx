import { RefreshCw, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  lastSynced: string;
}

const Header = ({ activeTab, onTabChange, onSync, isSyncing, lastSynced }: HeaderProps) => {
  const tabs = ['Dashboard', 'Feedback', 'Analytics'];

  return (
    <header className="bg-navy text-navy-foreground">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">Sentiflow AI</span>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <span className="text-sm text-gray-400">Powered by Cloudflare</span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab.toLowerCase())}
                className={`
                  pb-1 text-sm font-medium transition-all duration-200
                  ${activeTab === tab.toLowerCase()
                    ? 'text-white border-b-2 border-primary'
                    : 'text-gray-400 hover:text-white'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Last synced: {lastSynced}</span>
            </div>
            <Button
              onClick={onSync}
              disabled={isSyncing}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Data'}
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white gap-2"
            >
              <Send className="w-4 h-4" />
              Send Report
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
