import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Fetch unreported and tomorrow hearings for sidebar badges
  const { data: unreportedHearings = [] } = useQuery({
    queryKey: ['unreported-hearings'],
    queryFn: () => api.getUnreportedHearings(),
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: tomorrowHearings = [] } = useQuery({
    queryKey: ['tomorrow-hearings'],
    queryFn: () => api.getTomorrowHearings(),
    refetchInterval: 60000,
  });

  const { data: enrollmentReminders = [] } = useQuery({
    queryKey: ['enrollment-reminders'],
    queryFn: () => api.getEnrollmentReminders(),
    refetchInterval: 60000,
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        unreportedCount={unreportedHearings.length} 
        tomorrowCount={tomorrowHearings.length}
        enrollmentCount={enrollmentReminders.length}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
