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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarEvent, HearingStatus } from '@/types/legal';
import { cn } from '@/lib/utils';
import { getStatusClassName, getStatusDotClassName, getStatusLabel } from '@/lib/statusConfig';

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  currentMonth?: Date;
  onMonthChange?: (date: Date) => void;
  viewMode?: string;
  onViewChange?: (mode: string) => void;
}

// Status classes are now imported from centralized config

export function CalendarView({
  events,
  onEventClick,
  onDateClick,
  currentMonth = new Date(),
  onMonthChange,
  viewMode = 'month',
  onViewChange
}: CalendarViewProps) {
  const [openPopover, setOpenPopover] = useState<string | null>(null);

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
            className="h-9 w-9 hover:scale-110 active:scale-95 transition-all hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMonthChange?.(addMonths(currentMonth, 1))}
            className="h-9 w-9 hover:scale-110 active:scale-95 transition-all hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange?.(new Date())}
            className="ml-2 font-medium hover:scale-105 active:scale-95 transition-all"
          >
            Aujourd'hui
          </Button>
        </div>

        {/* Center: Month/Year title */}
        <h2 className="text-xl font-bold text-foreground capitalize font-serif">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>

        {/* Right: View Tabs */}
        <div className="flex items-center gap-3">
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
                "min-h-[120px] p-2 cursor-pointer transition-all duration-300 hover:bg-muted/80 hover:shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]",
                !isCurrentMonth && "bg-muted/20",
                isCurrentDay && "bg-primary/5"
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={cn(
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300",
                  isCurrentDay ? "bg-primary text-primary-foreground shadow-md scale-110" :
                    isCurrentMonth ? "text-foreground hover:bg-muted hover:scale-110" : "text-muted-foreground/40"
                )}>
                  {format(day, 'd')}
                </div>

                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 animate-in fade-in zoom-in duration-500">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <div
                        key={status}
                        className={cn("w-2 h-2 rounded-full ring-1 ring-background scale-100 hover:scale-150 transition-transform", getStatusDotClassName(status as HearingStatus))}
                        title={`${count} ${getStatusLabel(status as HearingStatus)}`}
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
                      "px-1.5 py-0.5 rounded text-[10px] font-bold truncate border transition-all duration-300 hover:scale-[1.05] hover:shadow-md hover:z-10 relative",
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
                  <Popover
                    open={openPopover === `day-${idx}`}
                    onOpenChange={(open) => setOpenPopover(open ? `day-${idx}` : null)}
                  >
                    <PopoverTrigger asChild>
                      <div
                        className="text-[10px] font-bold text-muted-foreground px-1 py-0.5 bg-muted/50 rounded text-center border border-border/50 cursor-pointer hover:bg-muted transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        +{dayEvents.length - 2} autres
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-80 p-0"
                      align="start"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-3 border-b border-border bg-muted/30">
                        <h4 className="font-semibold text-sm">
                          {format(day, 'EEEE d MMMM yyyy', { locale: fr })}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {dayEvents.length} audience{dayEvents.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "p-1.5 rounded border cursor-pointer transition-all hover:shadow-sm",
                              getStatusClassName(event.status)
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPopover(null);
                              onEventClick?.(event);
                            }}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-mono font-bold">
                                {event.caseReference}
                              </span>
                              {event.time && (
                                <span className="text-[10px] font-medium opacity-70">
                                  {event.time}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-medium truncate">
                              {event.title}
                            </p>
                            {event.jurisdiction && (
                              <p className="text-[9px] text-muted-foreground truncate mt-0.5">
                                {event.jurisdiction}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
