import { format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarEvent, HearingStatus } from '@/types/legal';
import { cn } from '@/lib/utils';
import { MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { getStatusClassName, getStatusIcon } from '@/lib/statusConfig';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DayViewProps {
    events: CalendarEvent[];
    selectedDate: Date;
    onEventClick: (event: CalendarEvent) => void;
    onDateChange?: (date: Date) => void;
    viewMode?: string;
    onViewChange?: (mode: string) => void;
}

// Configuration constants
const DAY_VIEW_CONFIG = {
    START_HOUR: 8,
    END_HOUR: 20,
    HOUR_HEIGHT: 80,
    EVENT_HEIGHT: 75,
    EVENT_MARGIN: '1rem',
} as const;

export function DayView({
    events,
    selectedDate,
    onEventClick,
    onDateChange,
    viewMode = 'day',
    onViewChange
}: DayViewProps) {
    const hours = Array.from(
        { length: DAY_VIEW_CONFIG.END_HOUR - DAY_VIEW_CONFIG.START_HOUR + 1 },
        (_, i) => i + DAY_VIEW_CONFIG.START_HOUR
    );

    const dayEvents = events.filter((event) => {
        const eventDate = new Date(event.date);
        const selectedDay = new Date(selectedDate);
        return eventDate.toDateString() === selectedDay.toDateString();
    });

    // Logique pour gérer les chevauchements
    const eventsByTime = dayEvents.reduce((acc, event) => {
        const time = event.time || 'no-time';
        if (!acc[time]) acc[time] = [];
        acc[time].push(event);
        return acc;
    }, {} as Record<string, CalendarEvent[]>);

    /**
     * Calcule la position d'un événement dans la grille horaire
     * @param timeStr - Heure au format HH:MM
     * @param index - Index de l'événement dans le slot temporel
     * @param total - Nombre total d'événements dans le slot
     */
    const getEventPosition = (timeStr: string | undefined, index: number, total: number) => {
        let top = 0;

        if (timeStr && /^\d{1,2}:\d{2}$/.test(timeStr)) {
            try {
                const [hours, minutes] = timeStr.split(':').map(Number);
                if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
                    top = (hours - DAY_VIEW_CONFIG.START_HOUR) * DAY_VIEW_CONFIG.HOUR_HEIGHT
                        + (minutes / 60) * DAY_VIEW_CONFIG.HOUR_HEIGHT;
                }
            } catch (error) {
                console.warn(`Invalid time format: ${timeStr}`);
            }
        }

        const width = 100 / total;
        const left = index * width;

        return {
            top,
            height: DAY_VIEW_CONFIG.EVENT_HEIGHT,
            width: `calc(${width}% - ${DAY_VIEW_CONFIG.EVENT_MARGIN})`,
            left: `calc(${left}% + ${DAY_VIEW_CONFIG.EVENT_MARGIN})`
        };
    };

    return (
        <div className="card-elevated overflow-hidden bg-background">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                {/* Left: Navigation */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDateChange?.(subDays(selectedDate, 1))}
                        className="h-9 w-9 hover:scale-110 active:scale-95 transition-all hover:bg-muted"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDateChange?.(addDays(selectedDate, 1))}
                        className="h-9 w-9 hover:scale-110 active:scale-95 transition-all hover:bg-muted"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDateChange?.(new Date())}
                        className="ml-2 font-medium hover:scale-105 active:scale-95 transition-all"
                    >
                        Aujourd'hui
                    </Button>
                </div>

                {/* Center: Title */}
                <h2 className="text-xl font-bold text-foreground capitalize font-serif whitespace-nowrap">
                    {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </h2>

                {/* Right: View Tabs */}
                <div className="flex items-center gap-2">
                    <Tabs value={viewMode} onValueChange={onViewChange}>
                        <TabsList className="bg-muted/50 border-none h-9 p-1">
                            <TabsTrigger value="month" className="text-xs px-3 h-7 transition-all duration-300 ease-out hover:scale-110 hover:translate-y-[-2px] hover:shadow-lg hover:bg-background/50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105 active:scale-95 active:translate-y-0">Mois</TabsTrigger>
                            <TabsTrigger value="week" className="text-xs px-3 h-7 transition-all duration-300 ease-out hover:scale-110 hover:translate-y-[-2px] hover:shadow-lg hover:bg-background/50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105 active:scale-95 active:translate-y-0">Semaine</TabsTrigger>
                            <TabsTrigger value="day" className="text-xs px-3 h-7 transition-all duration-300 ease-out hover:scale-110 hover:translate-y-[-2px] hover:shadow-lg hover:bg-background/50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105 active:scale-95 active:translate-y-0">Jour</TabsTrigger>
                            <TabsTrigger value="list" className="text-xs px-3 h-7 transition-all duration-300 ease-out hover:scale-110 hover:translate-y-[-2px] hover:shadow-lg hover:bg-background/50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105 active:scale-95 active:translate-y-0">Liste</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="relative flex overflow-y-auto max-h-[700px]">
                {/* Timeline column */}
                <div className="w-20 shrink-0 border-r border-border bg-muted/10">
                    {hours.map((hour) => (
                        <div key={hour} className="h-20 border-b border-border/50 relative">
                            <span className="absolute -top-3 right-3 text-xs font-bold text-muted-foreground uppercase">
                                {hour}h00
                            </span>
                        </div>
                    ))}
                </div>

                {/* Events grid */}
                <div className="flex-1 relative bg-grid-slate-100/[0.03] bg-[length:20px_20px]">
                    {hours.map((hour) => (
                        <div key={hour} className="h-20 border-b border-border/50" />
                    ))}

                    {Object.entries(eventsByTime).flatMap(([time, eventsInSlot]) =>
                        eventsInSlot.map((event, idx) => {
                            const { top, height, width, left } = getEventPosition(event.time, idx, eventsInSlot.length);

                            return (
                                <div
                                    key={event.id}
                                    className={cn(
                                        "absolute p-3 rounded-xl border shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] group z-10 overflow-hidden",
                                        getStatusClassName(event.status)
                                    )}
                                    style={{ top: `${top}px`, height: `${height}px`, width, left }}
                                    onClick={() => onEventClick(event)}
                                >
                                    <div className="flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-70 truncate">
                                                    {event.caseReference}
                                                </span>
                                                <div className="flex items-center gap-1 text-[10px] font-bold shrink-0">
                                                    {getStatusIcon(event.status, "h-3.5 w-3.5")}
                                                    {event.time || '--:--'}
                                                </div>
                                            </div>
                                            <h4 className="text-sm font-bold truncate mt-0.5 group-hover:underline">
                                                {event.title}
                                            </h4>
                                        </div>

                                        <div className="flex items-center gap-3 text-[10px] font-medium opacity-80 mt-1 overflow-hidden">
                                            <span className="flex items-center gap-1 shrink-0">
                                                <MapPin className="h-3 w-3" />
                                                {event.jurisdiction.split(' ').pop()}
                                            </span>
                                            <span className="flex items-center gap-1 truncate">
                                                <Users className="h-3 w-3" />
                                                {event.parties.split(' / ')[0]}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {dayEvents.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center p-8 bg-muted/50 rounded-2xl border border-dashed border-border max-w-sm">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Aucune audience programmée pour cette journée.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
