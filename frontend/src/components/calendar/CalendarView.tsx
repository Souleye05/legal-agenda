import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarEvent, HearingStatus } from '@/types/legal';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

const statusClasses: Record<HearingStatus, string> = {
  A_VENIR: 'hearing-upcoming',
  TENUE: 'hearing-done',
  NON_RENSEIGNEE: 'hearing-pending',
};

export function CalendarView({ events, onEventClick, onDateClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="card-elevated overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground font-serif capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Aujourd'hui
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((dayName) => (
          <div
            key={dayName}
            className="p-2 text-center text-xs font-medium text-muted-foreground uppercase"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={idx}
              className={cn(
                "calendar-cell",
                !isCurrentMonth && "bg-muted/30",
                isCurrentDay && "calendar-cell-today"
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div className={cn(
                "text-sm mb-1",
                isCurrentDay && "w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold",
                !isCurrentDay && !isCurrentMonth && "text-muted-foreground/50",
                !isCurrentDay && isCurrentMonth && "text-foreground font-medium"
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1 overflow-hidden max-h-[80px]">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={cn("hearing-item", statusClasses[event.status])}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    title={`${event.time || ''} ${event.title}`}
                  >
                    {event.time && <span className="font-medium">{event.time}</span>} {event.caseReference}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayEvents.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
