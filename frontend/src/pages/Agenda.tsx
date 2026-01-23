import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarView } from '@/components/calendar/CalendarView';
import { WeekView } from '@/components/calendar/WeekView';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { CalendarEvent } from '@/types/legal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HearingStatusBadge } from '@/components/hearings/HearingStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Clock, FileEdit, Calendar as CalendarIcon, Users, Building2, X, ArrowRight, Eye } from 'lucide-react';
import { HEARING_TYPE_LABELS } from '@/lib/constants';

export default function Agenda() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Fetch hearings from API
  const { data: hearings = [], isLoading } = useQuery({
    queryKey: ['hearings'],
    queryFn: () => api.getHearings(),
  });

  // Transform hearings to calendar events
  const events = useMemo(() => {
    return hearings.map((hearing: any) => ({
      id: hearing.id,
      title: hearing.affaire?.titre || 'Sans titre',
      date: new Date(hearing.date),
      time: hearing.heure,
      caseReference: hearing.affaire?.reference || '',
      parties: hearing.affaire?.parties?.map((p: any) => p.nom).join(' / ') || '',
      jurisdiction: hearing.affaire?.juridiction || '',
      chamber: hearing.affaire?.chambre || '',
      status: hearing.statut,
      type: hearing.type,
    })) as CalendarEvent[];
  }, [hearings]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleDateClick = (date: Date) => {
    navigate(`/agenda/nouvelle-audience?date=${format(date, 'yyyy-MM-dd')}`);
  };

  const handleNewHearing = () => {
    navigate('/agenda/nouvelle-audience');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="card-elevated p-8 text-center text-muted-foreground">
            Chargement du calendrier...
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <PageHeader 
          title="Agenda"
          description="Calendrier de vos audiences"
          action={{
            label: 'Nouvelle audience',
            onClick: handleNewHearing,
          }}
        >
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <TabsList>
              <TabsTrigger value="month">Mois</TabsTrigger>
              <TabsTrigger value="week">Semaine</TabsTrigger>
              <TabsTrigger value="list">Liste</TabsTrigger>
            </TabsList>
          </Tabs>
        </PageHeader>

        {viewMode === 'month' && (
          <CalendarView 
            events={events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        )}

        {viewMode === 'week' && (
          <WeekView 
            events={events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        )}

        {viewMode === 'list' && (
          <div className="card-elevated divide-y divide-border">
            {events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((event) => (
                <div 
                  key={event.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {event.caseReference}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {HEARING_TYPE_LABELS[event.type]}
                        </Badge>
                        <HearingStatusBadge status={event.status} />
                      </div>
                      <p className="font-medium text-foreground">{event.title}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {event.jurisdiction}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {event.time}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {format(new Date(event.date), 'dd MMM yyyy', { locale: fr })}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {format(new Date(event.date), 'EEEE', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Modern Event Detail Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-background via-background to-muted/20">
            {selectedEvent && (
              <div className="flex flex-col h-full max-h-[95vh]">
                {/* Header avec gradient et effet glassmorphism */}
                <div className="relative overflow-hidden border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background backdrop-blur-xl">
                  <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]"></div>
                  
                  <div className="relative p-8 space-y-4">
                    {/* Bouton fermer */}
                    <button
                      onClick={() => setSelectedEvent(null)}
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
                        {selectedEvent.title}
                      </h2>
                      
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className="text-sm px-3 py-1.5 font-mono bg-muted/50 border-border/50">
                          {selectedEvent.caseReference}
                        </Badge>
                        <Badge variant="outline" className="text-sm px-3 py-1.5 bg-background/50">
                          {HEARING_TYPE_LABELS[selectedEvent.type]}
                        </Badge>
                        <HearingStatusBadge status={selectedEvent.status} />
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
                            {format(new Date(selectedEvent.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                          </p>
                          {selectedEvent.time && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span className="font-semibold text-lg">{selectedEvent.time}</span>
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
                            {selectedEvent.jurisdiction}
                          </p>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">{selectedEvent.chamber}</span>
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
                          {selectedEvent.parties || 'Non renseigné'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Alerte si non renseigné */}
                  {selectedEvent.status === 'NON_RENSEIGNEE' && (
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
                      onClick={() => {
                        setSelectedEvent(null);
                        navigate(`/audiences/${selectedEvent.id}`);
                      }}
                    >
                      <Eye className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      Voir les détails complets
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    
                    {selectedEvent.status === 'NON_RENSEIGNEE' && (
                      <Button 
                        size="lg"
                        className="flex-1 h-12 rounded-xl font-semibold bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive hover:shadow-xl transition-all group"
                        onClick={() => {
                          setSelectedEvent(null);
                          navigate(`/a-renseigner?hearing=${selectedEvent.id}`);
                        }}
                      >
                        <FileEdit className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                        Renseigner le résultat
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}