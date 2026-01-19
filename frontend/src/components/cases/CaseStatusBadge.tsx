import { CaseStatus } from '@/types/legal';
import { cn } from '@/lib/utils';

interface CaseStatusBadgeProps {
  status: CaseStatus;
  className?: string;
}

const statusConfig: Record<CaseStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'status-active' },
  CLOTUREE: { label: 'Clôturée', className: 'status-closed' },
  RADIEE: { label: 'Radiée', className: 'status-radiated' },
};

export function CaseStatusBadge({ status, className }: CaseStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
