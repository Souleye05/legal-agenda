import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { mockDashboardStats } from '@/lib/mock-data';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        unreportedCount={mockDashboardStats.unreportedHearings} 
        tomorrowCount={mockDashboardStats.tomorrowHearings}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
