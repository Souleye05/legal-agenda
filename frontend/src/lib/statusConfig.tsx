import { HearingStatus } from '@/types/legal';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const STATUS_COLORS = {
  A_VENIR: {
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    text: 'text-sky-600',
    hover: 'hover:bg-sky-500/20',
    button: 'bg-sky-500 hover:bg-sky-600 border-sky-500',
    buttonHover: 'hover:bg-sky-500/10 hover:text-sky-600 hover:border-sky-500/50',
    dot: 'bg-sky-500',
  },
  TENUE: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-600',
    hover: 'hover:bg-emerald-500/20',
    button: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500',
    buttonHover: 'hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/50',
    dot: 'bg-emerald-500',
  },
  NON_RENSEIGNEE: {
    bg: 'bg-urgent/10',
    border: 'border-urgent/20',
    text: 'text-urgent',
    hover: 'hover:bg-urgent/20',
    button: 'bg-urgent hover:bg-urgent/90 border-urgent',
    buttonHover: 'hover:bg-urgent/10 hover:text-urgent hover:border-urgent/50',
    dot: 'bg-urgent',
  },
} as const;

export const STATUS_ICONS = {
  A_VENIR: Clock,
  TENUE: CheckCircle,
  NON_RENSEIGNEE: AlertCircle,
} as const;

export const STATUS_LABELS = {
  A_VENIR: 'À venir',
  TENUE: 'Tenue',
  NON_RENSEIGNEE: 'À renseigner',
} as const;

export function getStatusClassName(status: HearingStatus): string {
  const colors = STATUS_COLORS[status];
  return `${colors.bg} ${colors.border} ${colors.text} ${colors.hover}`;
}

export function getStatusDotClassName(status: HearingStatus): string {
  return STATUS_COLORS[status].dot;
}

export function getStatusIcon(status: HearingStatus, className?: string): JSX.Element {
  const IconComponent = STATUS_ICONS[status];
  return <IconComponent className={className} />;
}

export function getStatusLabel(status: HearingStatus): string {
  return STATUS_LABELS[status];
}
