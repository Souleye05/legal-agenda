import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { HearingStatusBadge } from '@/components/hearings/HearingStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    MapPin,
    Clock,
    FileEdit,
    Calendar as CalendarIcon,
    Users,
    Building2,
    X,
    ArrowRight,
    Eye
} from 'lucide-react';
import { HEARING_TYPE_LABELS } from '@/lib/constants';
import { CalendarEvent } from '@/types/legal';

interface EventDetailsDialogProps {
    event: CalendarEvent | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EventDetailsDialog({ event, open, onOpenChange }: EventDetailsDialogProps) {
    const navigate = useNavigate();

    if (!event) return null;

    const handleViewDetails = () => {
        onOpenChange(false);
        navigate(`/audiences/${event.id}`);
    };

    const handleRecordResult = () => {
        onOpenChange(false);
        navigate(`/a-renseigner?hearing=${event.id}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <div className="flex flex-col h-full max-h-[90vh]">
                    {/* Header with refined gradient and glassmorphism */}
                    <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-primary/5">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full"></div>
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 blur-[100px] rounded-full"></div>

                        <div className="relative p-8 pb-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-primary/15 rounded-xl ring-1 ring-primary/20 backdrop-blur-sm">
                                        <CalendarIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-[11px] font-bold text-primary/80 uppercase tracking-[0.2em]">
                                        Détails de l'audience
                                    </span>
                                </div>

                                <div className="space-y-4 pr-10">
                                    <h2 className="text-3xl font-serif font-bold text-foreground tracking-tight leading-[1.1]">
                                        {event.title}
                                    </h2>

                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm">
                                            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">Réf.</span>
                                            <span className="text-xs font-mono font-bold text-foreground">{event.caseReference}</span>
                                        </div>
                                        <Badge variant="secondary" className="px-3 py-1 bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-colors">
                                            {HEARING_TYPE_LABELS[event.type]}
                                        </Badge>
                                        <HearingStatusBadge status={event.status} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 scrollbar-hide">
                        {/* Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Date & Time Card */}
                            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-muted/30 to-background border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2.5 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors ring-1 ring-primary/5">
                                        <CalendarIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                            Date et Heure
                                        </span>
                                        <p className="text-lg font-bold text-foreground capitalize tracking-tight leading-tight">
                                            {format(new Date(event.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                                        </p>
                                        {event.time && (
                                            <div className="flex items-center gap-2 py-1 px-2.5 rounded-lg bg-primary/5 w-fit border border-primary/10">
                                                <Clock className="h-3.5 w-3.5 text-primary" />
                                                <span className="font-bold text-primary text-sm">{event.time}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Jurisdiction Card */}
                            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-muted/30 to-background border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2.5 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors ring-1 ring-primary/5">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                            Juridiction
                                        </span>
                                        <p className="text-lg font-bold text-foreground tracking-tight leading-tight">
                                            {event.jurisdiction}
                                        </p>
                                        <div className="flex items-center gap-2 text-muted-foreground/80">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span className="text-sm font-medium">{event.chamber}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Parties Section */}
                        <div className="relative p-6 rounded-2xl bg-muted/20 border border-border/40 overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 text-primary/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                                <Users className="h-24 w-24" />
                            </div>
                            <div className="relative flex items-start gap-4">
                                <div className="mt-1 p-2.5 bg-primary/5 rounded-xl ring-1 ring-primary/5">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                        Parties au litige
                                    </span>
                                    <p className="text-lg font-medium text-foreground leading-relaxed pr-12">
                                        {event.parties || 'Non renseigné'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Urgent Alert */}
                        {event.status === 'NON_RENSEIGNEE' && (
                            <div className="relative p-6 rounded-2xl bg-gradient-to-r from-urgent/10 via-urgent/5 to-transparent border border-urgent/20 overflow-hidden group">
                                <div className="absolute inset-0 bg-urgent/5 animate-pulse"></div>
                                <div className="relative flex items-start gap-4">
                                    <div className="p-2.5 bg-urgent/15 rounded-xl ring-1 ring-urgent/20 shadow-sm group-hover:rotate-12 transition-transform">
                                        <FileEdit className="h-5 w-5 text-urgent" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-black text-urgent uppercase tracking-wide">
                                            Audience en attente de résultat
                                        </p>
                                        <p className="text-sm text-foreground/70 leading-relaxed font-normal">
                                            Le délai pour renseigner cette audience est dépassé. Veuillez enregistrer le résultat pour mettre à jour le dossier.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer/Actions */}
                    <div className="p-6 border-t bg-muted/10 backdrop-blur-md">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-2xl font-bold bg-background/50 hover:bg-background border-border/60 hover:border-primary/40 hover:shadow-lg transition-all group overflow-hidden"
                                onClick={handleViewDetails}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    Voir le dossier
                                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </span>
                            </Button>

                            {event.status === 'NON_RENSEIGNEE' && (
                                <Button
                                    className="flex-1 h-12 rounded-2xl font-bold bg-urgent hover:bg-urgent/90 text-white shadow-lg shadow-urgent/20 hover:shadow-xl hover:shadow-urgent/30 transition-all group overflow-hidden"
                                    onClick={handleRecordResult}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <FileEdit className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                        Renseigner le résultat
                                        <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
