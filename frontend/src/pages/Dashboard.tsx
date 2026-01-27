import { useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, AlertTriangle, CalendarCheck, ClipboardList, Scale } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentHearings } from '@/components/dashboard/RecentHearings';
import { UrgentAlerts } from '@/components/dashboard/UrgentAlerts';
import { EnrollmentReminders } from '@/components/dashboard/EnrollmentReminders';
import { AppealReminders } from '@/components/dashboard/AppealReminders';
import { api } from '@/lib/api';
import type { Case, Hearing } from '@/types/api';

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch dashboard stats from API
  const { data: casesData = [] } = useQuery({
    queryKey: ['cases'],
    queryFn: () => api.getCases(),
    staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const { data: hearingsData = [] } = useQuery({
    queryKey: ['hearings'],
    queryFn: () => api.getHearings(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Gérer le cas où l'API retourne un objet paginé ou un tableau
  const cases = Array.isArray(casesData) ? casesData : (casesData as any).data || [];
  const hearings = Array.isArray(hearingsData) ? hearingsData : (hearingsData as any).data || [];

  // Debug logging
  console.log('[Dashboard] Cases data:', { 
    raw: casesData, 
    processed: cases, 
    length: cases.length,
    active: cases.filter((c: any) => c.statut === 'ACTIVE').length 
  });

  const { data: unreportedHearings = [] } = useQuery<Hearing[]>({
    queryKey: ['unreported-hearings'],
    queryFn: () => api.getUnreportedHearings(),
  });

  const { data: tomorrowHearings = [] } = useQuery<Hearing[]>({
    queryKey: ['tomorrow-hearings'],
    queryFn: () => api.getTomorrowHearings(),
  });

  const { data: enrollmentReminders = [] } = useQuery<Hearing[]>({
    queryKey: ['enrollment-reminders'],
    queryFn: () => api.getEnrollmentReminders(),
  });

  const { data: appealRemindersData = [] } = useQuery({
    queryKey: ['appeal-reminders'],
    queryFn: () => api.getAppealReminders(),
  });

  const appealReminders = Array.isArray(appealRemindersData) ? appealRemindersData : (appealRemindersData as any).data || [];

  // Calculate stats
  const activeCases = cases.filter((c) => c.statut === 'ACTIVE').length;
  const upcomingHearings = hearings.filter((h) => h.statut === 'A_VENIR').length;

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="Tableau de bord"
          description="Vue d'ensemble de votre activité juridique"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard
            title="Affaires actives"
            value={activeCases}
            icon={Briefcase}
            variant="primary"
            onClick={() => navigate('/affaires')}
          />
          <StatCard
            title="Audiences à venir"
            value={upcomingHearings}
            icon={Calendar}
            variant="info"
            onClick={() => navigate('/agenda')}
          />
          <StatCard
            title="À renseigner"
            value={unreportedHearings.length}
            icon={AlertTriangle}
            variant="urgent"
            description="Audiences non renseignées"
            onClick={() => navigate('/a-renseigner')}
          />
          <StatCard
            title="Demain"
            value={tomorrowHearings.length}
            icon={CalendarCheck}
            variant="success"
            description="Audience(s) à préparer"
            onClick={() => navigate('/demain')}
          />
          <StatCard
            title="Enrôlements"
            value={enrollmentReminders.length}
            icon={ClipboardList}
            variant='primary'
            description="Rappels actifs"
            onClick={() => navigate('/rappels-enrolement')}
          />
          <StatCard
            title="Recours"
            value={appealReminders.length}
            icon={Scale}
            variant="warning"
            description="À effectuer"
            onClick={() => navigate('/recours')}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 font-serif">Actions rapides</h2>
          <QuickActions />
        </div>

        {/* Enrollment Reminders */}
        <EnrollmentReminders />

        {/* Appeal Reminders */}
        <AppealReminders />

        {/* Alerts & Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UrgentAlerts />
          <RecentHearings />
        </div>
      </div>
    </MainLayout>
  );
}
