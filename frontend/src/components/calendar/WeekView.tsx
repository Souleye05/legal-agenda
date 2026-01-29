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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarEvent, HearingStatus } from '@/types/legal';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  currentWeek?: Date;
  onWeekChange?: (date: Date) => void;
  viewMode?: string;
  onViewChange?: (mode: string) => void;
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
  onWeekChange,
  viewMode = 'week',
  onViewChange
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
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        {/* Left: Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onWeekChange?.(subWeeks(currentWeek, 1))}
            className="h-9 w-9 hover:scale-110 active:scale-95 transition-all hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onWeekChange?.(addWeeks(currentWeek, 1))}
            className="h-9 w-9 hover:scale-110 active:scale-95 transition-all hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWeekChange?.(new Date())}
            className="ml-2 font-medium hover:scale-105 active:scale-95 transition-all"
          >
            Aujourd'hui
          </Button>
        </div>

        {/* Center: Title */}
        <h2 className="text-xl font-bold text-foreground capitalize font-serif whitespace-nowrap">
          Semaine du {format(weekStart, 'd', { locale: fr })} au {format(weekEnd, 'd MMMM yyyy', { locale: fr })}
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

      {/* Week grid */}
      <div className="grid grid-cols-7 divide-x divide-border">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[200px] p-2 cursor-pointer hover:bg-muted/50 transition-all duration-300",
                isCurrentDay && "bg-primary/5"
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div className="text-center mb-3">
                <div className="text-xs text-muted-foreground uppercase">
                  {format(day, 'EEE', { locale: fr })}
                </div>
                <div className={cn(
                  "text-lg font-medium mt-1 transition-all duration-300",
                  isCurrentDay ? "w-8 h-8 mx-auto flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md scale-110" : "hover:scale-110"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn("hearing-item text-xs transition-all duration-300 hover:scale-105 hover:shadow-md", statusClasses[event.status])}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    title={`${event.time || ''} ${event.title}`}
                  >
                    <div className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{event.time || '--:--'}</div>
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
