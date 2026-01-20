import { useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, AlertTriangle, CalendarCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentHearings } from '@/components/dashboard/RecentHearings';
import { UrgentAlerts } from '@/components/dashboard/UrgentAlerts';
import { api } from '@/lib/api';
import type { Case, Hearing } from '@/types/api';

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch dashboard stats from API
  const { data: cases = [] } = useQuery<Case[]>({
    queryKey: ['cases'],
    queryFn: () => api.getCases(),
  });

  const { data: hearings = [] } = useQuery<Hearing[]>({
    queryKey: ['hearings'],
    queryFn: () => api.getHearings(),
  });

  const { data: unreportedHearings = [] } = useQuery<Hearing[]>({
    queryKey: ['unreported-hearings'],
    queryFn: () => api.getUnreportedHearings(),
  });

  const { data: tomorrowHearings = [] } = useQuery<Hearing[]>({
    queryKey: ['tomorrow-hearings'],
    queryFn: () => api.getTomorrowHearings(),
  });

  // Calculate stats
  const activeCases = cases.filter((c) => c.statut === 'ACTIVE').length;
  const upcomingHearings = hearings.filter((h) => h.statut === 'A_VENIR').length;

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        <PageHeader 
          title="Tableau de bord"
          description="Vue d'ensemble de votre activité juridique"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Affaires actives"
            value={activeCases}
            icon={Briefcase}
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
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 font-serif">Actions rapides</h2>
          <QuickActions />
        </div>

        {/* Alerts & Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UrgentAlerts />
          <RecentHearings />
        </div>
      </div>
    </MainLayout>
  );
}
