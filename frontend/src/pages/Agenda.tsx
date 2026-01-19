import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarView } from '@/components/calendar/CalendarView';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCalendarEvents } from '@/lib/mock-data';
import { CalendarEvent } from '@/types/legal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HearingStatusBadge } from '@/components/hearings/HearingStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Clock, FileEdit } from 'lucide-react';
import { hearingTypeLabels } from '@/lib/mock-data';

export default function Agenda() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const events = getCalendarEvents();

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // TODO: Open new hearing dialog for this date
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <PageHeader 
          title="Agenda"
          description="Calendrier de vos audiences"
          action={{
            label: 'Nouvelle audience',
            onClick: () => console.log('New hearing'),
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
                          {hearingTypeLabels[event.type]}
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

        {/* Event Detail Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">{selectedEvent?.title}</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {selectedEvent.caseReference}
                  </span>
                  <Badge variant="outline">
                    {hearingTypeLabels[selectedEvent.type]}
                  </Badge>
                  <HearingStatusBadge status={selectedEvent.status} />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-24">Date :</span>
                    <span className="font-medium">
                      {format(new Date(selectedEvent.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  {selectedEvent.time && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-24">Heure :</span>
                      <span className="font-medium">{selectedEvent.time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-24">Juridiction :</span>
                    <span className="font-medium">{selectedEvent.jurisdiction}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-24">Chambre :</span>
                    <span className="font-medium">{selectedEvent.chamber}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground w-24">Parties :</span>
                    <span className="font-medium">{selectedEvent.parties}</span>
                  </div>
                </div>

                {selectedEvent.status === 'NON_RENSEIGNEE' && (
                  <Button 
                    className="w-full bg-urgent hover:bg-urgent/90"
                    onClick={() => {
                      setSelectedEvent(null);
                      navigate(`/a-renseigner?hearing=${selectedEvent.id}`);
                    }}
                  >
                    <FileEdit className="h-4 w-4 mr-2" />
                    Renseigner le résultat
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
