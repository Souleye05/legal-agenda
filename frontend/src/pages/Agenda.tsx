import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarView } from '@/components/calendar/CalendarView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { CalendarEvent, HearingStatus } from '@/types/legal';
import { HearingStatusBadge } from '@/components/hearings/HearingStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Clock, FileEdit, Calendar as CalendarIcon, Users, Building2, ArrowRight, X } from 'lucide-react';
import { HEARING_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { EventSearchBar } from '@/components/agenda/EventSearchBar';
import { StatusFilterButton } from '@/components/agenda/StatusFilterButton';
import { EventDetailsDialog } from '@/components/agenda/EventDetailsDialog';
import { useEventFilters } from '@/hooks/useEventFilters';

export default function Agenda() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<HearingStatus | 'all'>('all');

  // Fetch hearings from API using the calendar optimized endpoint
  const { data: hearingsData = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['hearings', format(currentDate, 'yyyy-MM'), viewMode],
    queryFn: () => {
      if (viewMode === 'month' || viewMode === 'week') {
        return api.getCalendar(
          format(currentDate, 'MM'),
          format(currentDate, 'yyyy')
        );
      }
      return api.getHearings(); // List view might still want all or a specific range
    },
  });

  // Gérer le cas où l'API retourne un objet paginé ou un tableau
  const hearings = Array.isArray(hearingsData) ? hearingsData : (hearingsData as any).data || [];

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

  // Use custom hook for filtering and grouping
  const { filteredEvents, groupedEvents } = useEventFilters({
    events,
    searchQuery,
    statusFilter,
  });

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleDateClick = (date: Date) => {
    navigate(`/agenda/nouvelle-audience?date=${format(date, 'yyyy-MM-dd')}`);
  };

  const handleNewHearing = () => {
    navigate('/agenda/nouvelle-audience');
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="card-elevated p-8 text-center text-muted-foreground">
          Chargement du calendrier...
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="card-elevated p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-destructive/10 rounded-full">
              <X className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium">
            Une erreur est survenue lors du chargement de l'agenda.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Agenda"
          description="Calendrier de vos audiences"
          action={{
            label: 'Nouvelle audience',
            onClick: handleNewHearing,
          }}
        />

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border/50">
          <EventSearchBar value={searchQuery} onChange={setSearchQuery} />

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
            <StatusFilterButton
              status="all"
              label="Tous"
              isActive={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            />
            <StatusFilterButton
              status="NON_RENSEIGNEE"
              label="À renseigner"
              icon={FileEdit}
              isActive={statusFilter === 'NON_RENSEIGNEE'}
              onClick={() => setStatusFilter('NON_RENSEIGNEE')}
            />
            <StatusFilterButton
              status="A_VENIR"
              label="À venir"
              isActive={statusFilter === 'A_VENIR'}
              onClick={() => setStatusFilter('A_VENIR')}
            />
            <StatusFilterButton
              status="TENUE"
              label="Tenue"
              isActive={statusFilter === 'TENUE'}
              onClick={() => setStatusFilter('TENUE')}
            />
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex justify-end">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <TabsList>
              <TabsTrigger value="month">Mois</TabsTrigger>
              <TabsTrigger value="week">Semaine</TabsTrigger>
              <TabsTrigger value="day">Jour</TabsTrigger>
              <TabsTrigger value="list">Liste</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {viewMode === 'month' && (
          <CalendarView
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            currentMonth={currentDate}
            onMonthChange={handleDateChange}
          />
        )}

        {viewMode === 'week' && (
          <WeekView
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            currentWeek={currentDate}
            onWeekChange={handleDateChange}
          />
        )}

        {viewMode === 'day' && (
          <DayView
            events={filteredEvents}
            selectedDate={currentDate}
            onEventClick={handleEventClick}
          />
        )}

        {viewMode === 'list' && (
          <div className="space-y-8">
            {groupedEvents.length === 0 ? (
              <div className="card-elevated p-12 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-muted rounded-full">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Aucune audience trouvée</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all'
                      ? "Aucune audience ne correspond à vos critères de recherche."
                      : "Vous n'avez pas encore d'audiences programmées."}
                  </p>
                </div>
                {!searchQuery && statusFilter === 'all' && (
                  <Button onClick={handleNewHearing} variant="outline" size="sm">
                    Ajouter une audience
                  </Button>
                )}
              </div>
            ) : (
              groupedEvents.map((group) => (
                <div key={group.title} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                      {group.title} ({group.events.length})
                    </h3>
                    <div className="h-px flex-1 bg-border/50" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.events.map((event) => (
                      <div
                        key={event.id}
                        className="group card-elevated p-5 hover:border-primary/50 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative flex items-center justify-between gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {event.caseReference}
                              </span>
                              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight bg-background/50 border-border/50">
                                {HEARING_TYPE_LABELS[event.type]}
                              </Badge>
                              <HearingStatusBadge status={event.status} />
                            </div>

                            <h4 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {event.title}
                            </h4>

                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Building2 className="h-3.5 w-3.5" />
                                {event.jurisdiction}
                              </span>
                              {event.time && (
                                <span className="flex items-center gap-1.5 font-medium py-1 px-2 bg-muted/50 rounded-lg">
                                  <Clock className="h-3.5 w-3.5 text-primary" />
                                  {event.time}
                                </span>
                              )}
                              <span className="flex items-center gap-1.5 font-medium">
                                <Users className="h-3.5 w-3.5" />
                                {event.parties.split(' / ')[0]}...
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="p-2 bg-muted/50 rounded-xl border border-border group-hover:bg-primary group-hover:border-primary transition-all">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary-foreground transition-colors">
                                {format(new Date(event.date), 'MMM', { locale: fr })}
                              </p>
                              <p className="text-2xl text-center font-black text-foreground group-hover:text-primary-foreground transition-colors">
                                {format(new Date(event.date), 'dd')}
                              </p>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter text-center">
                              {format(new Date(event.date), 'EEEE', { locale: fr })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <EventDetailsDialog
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
        />
      </div>
    </MainLayout>
  );
}