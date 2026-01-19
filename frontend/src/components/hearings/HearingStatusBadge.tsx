import { HearingStatus } from '@/types/legal';
import { cn } from '@/lib/utils';

interface HearingStatusBadgeProps {
  status: HearingStatus;
  className?: string;
}

const statusConfig: Record<HearingStatus, { label: string; className: string }> = {
  A_VENIR: { label: 'À venir', className: 'status-upcoming' },
  TENUE: { label: 'Tenue', className: 'status-active' },
  NON_RENSEIGNEE: { label: 'Non renseignée', className: 'status-pending' },
};

export function HearingStatusBadge({ status, className }: HearingStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
