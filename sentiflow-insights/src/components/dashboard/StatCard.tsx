import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'stable';
  };
  iconBgColor: 'orange' | 'green' | 'red' | 'blue';
  suffix?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, iconBgColor, suffix }: StatCardProps) => {
  const bgColorClasses = {
    orange: 'bg-primary/10',
    green: 'bg-success/10',
    red: 'bg-destructive/10',
    blue: 'bg-info/10',
  };

  const iconColorClasses = {
    orange: 'text-primary',
    green: 'text-success',
    red: 'text-destructive',
    blue: 'text-info',
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    stable: 'text-muted-foreground',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-card card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-3xl font-bold text-foreground">
            {value}
            {suffix && <span className="text-xl">{suffix}</span>}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
          {trend && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${trendColors[trend.direction]}`}>
              <span>{trendIcons[trend.direction]}</span>
              {trend.value} from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${bgColorClasses[iconBgColor]}`}>
          <Icon className={`w-6 h-6 ${iconColorClasses[iconBgColor]}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
