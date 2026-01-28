import { STATUS_COLORS, STATUS_LABELS } from '@/lib/statusConfig';

export function StatusLegend() {
    return (
        <div className="flex flex-wrap items-center gap-6 px-4 py-2 bg-muted/10 rounded-xl border border-border/30 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS.A_VENIR.dot}`} />
                {STATUS_LABELS.A_VENIR}
            </span>
            <span className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS.TENUE.dot}`} />
                {STATUS_LABELS.TENUE}
            </span>
            <span className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS.NON_RENSEIGNEE.dot}`} />
                {STATUS_LABELS.NON_RENSEIGNEE} / Urgente
            </span>
        </div>
    );
}
