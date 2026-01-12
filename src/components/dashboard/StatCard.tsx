import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-chart-1/10 text-chart-1',
  warning: 'bg-chart-4/10 text-chart-4',
  danger: 'bg-destructive/10 text-destructive',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'primary', onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl bg-card p-4 shadow-sm border border-border/50 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {trend && (
            <p className={cn('text-xs mt-2', trend.value >= 0 ? 'text-chart-1' : 'text-destructive')}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-xl', colorClasses[color])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
