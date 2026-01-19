import { useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, AlertTriangle, CalendarCheck } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentHearings } from '@/components/dashboard/RecentHearings';
import { UrgentAlerts } from '@/components/dashboard/UrgentAlerts';
import { mockDashboardStats } from '@/lib/mock-data';

export default function Dashboard() {
  const navigate = useNavigate();

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
            value={mockDashboardStats.activeCases}
            icon={Briefcase}
            onClick={() => navigate('/affaires')}
          />
          <StatCard
            title="Audiences à venir"
            value={mockDashboardStats.upcomingHearings}
            icon={Calendar}
            variant="info"
            onClick={() => navigate('/agenda')}
          />
          <StatCard
            title="À renseigner"
            value={mockDashboardStats.unreportedHearings}
            icon={AlertTriangle}
            variant="urgent"
            description="Audiences non renseignées"
            onClick={() => navigate('/a-renseigner')}
          />
          <StatCard
            title="Demain"
            value={mockDashboardStats.tomorrowHearings}
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
