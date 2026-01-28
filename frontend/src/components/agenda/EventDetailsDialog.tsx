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
            <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="flex flex-col h-full max-h-[95vh]">
                    {/* Header avec gradient et effet glassmorphism */}
                    <div className="relative overflow-hidden border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background backdrop-blur-xl">
                        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]"></div>

                        <div className="relative p-8 space-y-4">
                            {/* Bouton fermer */}
                            <button
                                onClick={() => onOpenChange(false)}
                                className="absolute top-4 right-4 p-2 rounded-xl bg-background/80 hover:bg-background border border-border/50 transition-all hover:shadow-lg group"
                            >
                                <X className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </button>

                            {/* Titre et référence */}
                            <div className="pr-12 space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <CalendarIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        Détails de l'audience
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold text-foreground leading-tight">
                                    {event.title}
                                </h2>

                                <div className="flex items-center gap-3 flex-wrap">
                                    <Badge variant="outline" className="text-sm px-3 py-1.5 font-mono bg-muted/50 border-border/50">
                                        {event.caseReference}
                                    </Badge>
                                    <Badge variant="outline" className="text-sm px-3 py-1.5 bg-background/50">
                                        {HEARING_TYPE_LABELS[event.type]}
                                    </Badge>
                                    <HearingStatusBadge status={event.status} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content scrollable */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        {/* Informations principales en cartes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date et heure */}
                            <div className="group p-6 rounded-2xl bg-muted/50 border border-border hover:border-primary/50 transition-all hover:shadow-lg">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                                        <CalendarIcon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Date & Heure
                                        </span>
                                        <p className="text-xl font-bold text-foreground capitalize">
                                            {format(new Date(event.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                                        </p>
                                        {event.time && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span className="font-semibold text-lg">{event.time}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Juridiction */}
                            <div className="group p-6 rounded-2xl bg-muted/50 border border-border hover:border-primary/50 transition-all hover:shadow-lg">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                                        <Building2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Juridiction
                                        </span>
                                        <p className="text-lg font-bold text-foreground">
                                            {event.jurisdiction}
                                        </p>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span className="font-medium">{event.chamber}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Parties */}
                        <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Parties au litige
                                    </span>
                                    <p className="text-lg font-semibold text-foreground leading-relaxed">
                                        {event.parties || 'Non renseigné'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Alerte si non renseigné */}
                        {event.status === 'NON_RENSEIGNEE' && (
                            <div className="p-5 rounded-2xl bg-gradient-to-r from-destructive/10 to-destructive/5 border-2 border-destructive/30 border-dashed">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-destructive/20 rounded-lg">
                                        <FileEdit className="h-5 w-5 text-destructive" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-destructive mb-1">
                                            ⚠️ Audience non renseignée
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Cette audience nécessite que vous renseigniez son résultat.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer avec actions */}
                    <div className="border-t bg-muted/30 backdrop-blur-xl p-6">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex-1 h-12 rounded-xl font-semibold hover:bg-background hover:shadow-lg transition-all group"
                                onClick={handleViewDetails}
                            >
                                <Eye className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                                Voir les détails complets
                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>

                            {event.status === 'NON_RENSEIGNEE' && (
                                <Button
                                    size="lg"
                                    className="flex-1 h-12 rounded-xl font-semibold bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive hover:shadow-xl transition-all group"
                                    onClick={handleRecordResult}
                                >
                                    <FileEdit className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                                    Renseigner le résultat
                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
