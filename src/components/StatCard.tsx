import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendUp, colorClass = 'gradient-primary' }) => {
  return (
    <div className="stat-card flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {trend && (
          <p className={cn("text-xs font-medium", trendUp ? "text-success" : "text-destructive")}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
