import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const { data: appealRemindersData = [] } = useQuery({
    queryKey: ['appeal-reminders'],
    queryFn: () => api.getAppealReminders(),
    refetchInterval: 60000,
  });

  // Gérer le cas où l'API retourne un objet paginé ou un tableau
  const appealReminders = Array.isArray(appealRemindersData) ? appealRemindersData : (appealRemindersData as any).data || [];

  const sidebarProps = {
    unreportedCount: unreportedHearings.length,
    tomorrowCount: tomorrowHearings.length,
    enrollmentCount: enrollmentReminders.length,
    appealCount: appealReminders.length,
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Desktop */}
      <Sidebar
        {...sidebarProps}
        className="hidden md:flex shrink-0"
      />

      {/* Sidebar Mobile */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 border-none">
          <VisuallyHidden>
            <SheetTitle>Menu de navigation</SheetTitle>
            <SheetDescription>
              Accédez aux différentes sections de l'application
            </SheetDescription>
          </VisuallyHidden>
          <Sidebar
            {...sidebarProps}
            onItemClick={() => setMobileMenuOpen(false)}
            className="w-full"
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto py-6 md:py-8 bg-muted/10">
          <div className="container mx-auto px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
