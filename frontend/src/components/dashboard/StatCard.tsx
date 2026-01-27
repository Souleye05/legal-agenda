import { cn } from '@/lib/utils';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  variant?: 'default' | 'urgent' | 'success' | 'info' | 'primary' | 'warning';
  onClick?: () => void;
  trend?: string;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  variant = 'default',
  onClick,
  trend
}: StatCardProps) {
  const variants = {
    default: {
      container: 'bg-card hover:bg-card/80',
      icon: 'bg-primary text-primary-foreground',
      value: 'text-foreground',
    },
    primary: {
      container: 'bg-primary text-primary-foreground',
      icon: 'bg-primary-foreground/20 text-primary-foreground',
      value: 'text-primary-foreground',
    },
    urgent: {
      container: 'bg-card hover:bg-card/80',
      icon: 'bg-urgent text-urgent-foreground',
      value: 'text-foreground',
    },
    success: {
      container: 'bg-card hover:bg-card/80',
      icon: 'bg-success text-success-foreground',
      value: 'text-foreground',
    },
    info: {
      container: 'bg-card hover:bg-card/80',
      icon: 'bg-foreground text-background',
      value: 'text-foreground',
    },
    warning: {
      container: 'bg-card hover:bg-card/80',
      icon: 'bg-warning text-warning-foreground',
      value: 'text-foreground',
    },
  };

  const styles = variants[variant];

  return (
    <div 
      className={cn(
        "relative p-5 rounded-2xl border border-border/50 transition-all duration-200",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
        styles.container,
        onClick && "cursor-pointer group"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <p className={cn(
          "text-sm font-medium",
          variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'
        )}>
          {title}
        </p>
        <div className={cn("p-2.5 rounded-xl", styles.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className={cn("text-4xl font-bold tracking-tight", styles.value)}>
        {value}
      </p>

      {(description || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              variant === 'primary' 
                ? 'bg-primary-foreground/20 text-primary-foreground' 
                : 'bg-success/10 text-success'
            )}>
              {trend}
            </span>
          )}
          {description && (
            <p className={cn(
              "text-sm",
              variant === 'primary' ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}>
              {description}
            </p>
          )}
        </div>
      )}

      {onClick && (
        <ArrowUpRight className={cn(
          "absolute top-5 right-14 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
          variant === 'primary' ? 'text-primary-foreground/50' : 'text-muted-foreground'
        )} />
      )}
    </div>
  );
}
