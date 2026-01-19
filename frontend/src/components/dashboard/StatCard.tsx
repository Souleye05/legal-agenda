import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  variant?: 'default' | 'urgent' | 'success' | 'info';
  onClick?: () => void;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  variant = 'default',
  onClick 
}: StatCardProps) {
  const variants = {
    default: {
      container: 'bg-card',
      icon: 'bg-primary/10 text-primary',
      value: 'text-foreground',
    },
    urgent: {
      container: 'bg-card border-urgent/20',
      icon: 'bg-urgent/10 text-urgent',
      value: 'text-urgent',
    },
    success: {
      container: 'bg-card',
      icon: 'bg-success/10 text-success',
      value: 'text-success',
    },
    info: {
      container: 'bg-card',
      icon: 'bg-accent/10 text-accent',
      value: 'text-accent',
    },
  };

  const styles = variants[variant];

  return (
    <div 
      className={cn(
        "card-elevated p-6 transition-all",
        styles.container,
        onClick && "cursor-pointer hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-3xl font-bold mt-2 font-serif", styles.value)}>
            {value}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
