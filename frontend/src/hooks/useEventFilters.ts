import { useMemo } from 'react';
import { CalendarEvent, HearingStatus } from '@/types/legal';
import { isToday, isTomorrow, isThisWeek, isAfter, startOfDay, addDays } from 'date-fns';

interface UseEventFiltersProps {
    events: CalendarEvent[];
    searchQuery: string;
    statusFilter: HearingStatus | 'all';
}

interface GroupedEvents {
    title: string;
    events: CalendarEvent[];
}

export function useEventFilters({ events, searchQuery, statusFilter }: UseEventFiltersProps) {
    // Filter events based on search query and status filter
    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesSearch =
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.caseReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.parties.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [events, searchQuery, statusFilter]);

    // Group events for list view
    const groupedEvents = useMemo(() => {
        const sorted = [...filteredEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const groups: GroupedEvents[] = [
            { title: "Aujourd'hui", events: [] },
            { title: 'Demain', events: [] },
            { title: 'Cette semaine', events: [] },
            { title: 'Plus tard', events: [] },
            { title: 'Passé', events: [] },
        ];

        const now = new Date();
        const today = startOfDay(now);
        const tomorrow = addDays(today, 1);

        sorted.forEach(event => {
            const eventDate = startOfDay(new Date(event.date));
            if (isToday(eventDate)) {
                groups[0].events.push(event);
            } else if (isTomorrow(eventDate)) {
                groups[1].events.push(event);
            } else if (isThisWeek(eventDate, { weekStartsOn: 1 }) && isAfter(eventDate, today)) {
                groups[2].events.push(event);
            } else if (isAfter(eventDate, today)) {
                groups[3].events.push(event);
            } else {
                groups[4].events.push(event);
            }
        });

        return groups.filter(g => g.events.length > 0);
    }, [filteredEvents]);

    return {
        filteredEvents,
        groupedEvents,
    };
}
