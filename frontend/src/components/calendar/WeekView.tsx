import { useState } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarEvent, HearingStatus } from '@/types/legal';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  currentWeek?: Date;
  onWeekChange?: (date: Date) => void;
}

const statusClasses: Record<HearingStatus, string> = {
  A_VENIR: 'hearing-upcoming',
  TENUE: 'hearing-done',
  NON_RENSEIGNEE: 'hearing-pending',
};

export function WeekView({
  events,
  onEventClick,
  onDateClick,
  currentWeek = new Date(),
  onWeekChange
}: WeekViewProps) {

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const days = [];
  let day = weekStart;
  while (day <= weekEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  return (
    <div className="card-elevated overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground font-serif">
          Semaine du {format(weekStart, 'd', { locale: fr })} au {format(weekEnd, 'd MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onWeekChange?.(subWeeks(currentWeek, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onWeekChange?.(new Date())}
          >
            Cette semaine
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onWeekChange?.(addWeeks(currentWeek, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 divide-x divide-border">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[200px] p-2 cursor-pointer hover:bg-muted/50 transition-colors",
                isCurrentDay && "bg-primary/5"
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div className="text-center mb-3">
                <div className="text-xs text-muted-foreground uppercase">
                  {format(day, 'EEE', { locale: fr })}
                </div>
                <div className={cn(
                  "text-lg font-medium mt-1",
                  isCurrentDay && "w-8 h-8 mx-auto flex items-center justify-center rounded-full bg-primary text-primary-foreground"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn("hearing-item text-xs", statusClasses[event.status])}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    title={`${event.time || ''} ${event.title}`}
                  >
                    <div className="font-medium">{event.time || '--:--'}</div>
                    <div className="truncate">{event.caseReference}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
