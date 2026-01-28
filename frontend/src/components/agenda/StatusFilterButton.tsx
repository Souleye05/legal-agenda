import { HearingStatus } from '@/types/legal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { STATUS_COLORS } from '@/lib/statusConfig';
import { LucideIcon } from 'lucide-react';

interface StatusFilterButtonProps {
    status: HearingStatus | 'all';
    label: string;
    icon?: LucideIcon;
    isActive: boolean;
    onClick: () => void;
}

export function StatusFilterButton({ status, label, icon: Icon, isActive, onClick }: StatusFilterButtonProps) {
    // Pour le bouton "Tous"
    if (status === 'all') {
        return (
            <Button
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={onClick}
                className="rounded-full px-4 h-9"
            >
                {label}
            </Button>
        );
    }

    // Pour les boutons de statut spécifiques
    const colors = STATUS_COLORS[status];

    return (
        <Button
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={onClick}
            className={cn(
                "rounded-full px-4 h-9 gap-2 transition-all",
                isActive
                    ? `${colors.button} text-white`
                    : colors.buttonHover
            )}
        >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {label}
        </Button>
    );
}
