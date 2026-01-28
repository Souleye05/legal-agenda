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
import { getStatusClassName, getStatusDotClassName } from '@/lib/statusConfig';

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  currentMonth?: Date;
  onMonthChange?: (date: Date) => void;
}

// Status classes are now imported from centralized config

export function CalendarView({
  events,
  onEventClick,
  onDateClick,
  currentMonth = new Date(),
  onMonthChange
}: CalendarViewProps) {
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
      {/* FullCalendar-style Navigation Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        {/* Left: Navigation arrows + Today button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMonthChange?.(subMonths(currentMonth, 1))}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMonthChange?.(addMonths(currentMonth, 1))}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange?.(new Date())}
            className="ml-2 font-medium"
          >
            Aujourd'hui
          </Button>
        </div>

        {/* Center: Month/Year title */}
        <h2 className="text-lg font-bold text-foreground capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>

        {/* Right: Empty space for symmetry (view buttons are in parent) */}
        <div className="w-[200px]" />
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
      <div className="grid grid-cols-7 divide-x divide-y divide-border border-b border-r border-border">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);

          // Summary of statuses
          const statusCounts = dayEvents.reduce((acc, e) => {
            acc[e.status] = (acc[e.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[120px] p-2 cursor-pointer transition-colors hover:bg-muted/50",
                !isCurrentMonth && "bg-muted/20",
                isCurrentDay && "bg-primary/5"
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={cn(
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                  isCurrentDay ? "bg-primary text-primary-foreground" :
                    isCurrentMonth ? "text-foreground" : "text-muted-foreground/40"
                )}>
                  {format(day, 'd')}
                </div>

                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <div
                        key={status}
                        className={cn("w-2 h-2 rounded-full", getStatusDotClassName(status as HearingStatus))}
                        title={`${count} ${status}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold truncate border transition-opacity hover:opacity-80",
                      getStatusClassName(event.status)
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    title={`${event.time || ''} ${event.title}`}
                  >
                    {event.time && <span className="opacity-70 mr-1">{event.time}</span>}
                    {event.caseReference}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] font-bold text-muted-foreground px-1 py-0.5 bg-muted/50 rounded text-center border border-border/50">
                    +{dayEvents.length - 2} autres
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
