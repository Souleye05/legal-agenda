import { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CaseCard } from '@/components/cases/CaseCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockCases } from '@/lib/mock-data';
import { CaseStatus } from '@/types/legal';

export default function Cases() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');

  const filteredCases = mockCases.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.parties.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCases = filteredCases.filter(c => c.status === 'ACTIVE');
  const closedCases = filteredCases.filter(c => c.status !== 'ACTIVE');

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <PageHeader 
          title="Affaires"
          description="Gérez vos dossiers et affaires en cours"
          action={{
            label: 'Nouvelle affaire',
            onClick: () => console.log('New case'),
          }}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par référence, titre ou partie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as CaseStatus | 'all')}>
            <TabsList>
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="ACTIVE">Actives</TabsTrigger>
              <TabsTrigger value="CLOTUREE">Clôturées</TabsTrigger>
              <TabsTrigger value="RADIEE">Radiées</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {statusFilter === 'all' || statusFilter === 'ACTIVE' ? (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 font-serif">
                Affaires actives ({activeCases.length})
              </h2>
              {activeCases.length === 0 ? (
                <div className="card-elevated p-8 text-center text-muted-foreground">
                  Aucune affaire active trouvée
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeCases.map((c) => (
                    <CaseCard key={c.id} caseData={c} />
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {(statusFilter === 'all' || statusFilter === 'CLOTUREE' || statusFilter === 'RADIEE') && closedCases.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 font-serif">
                Affaires clôturées ({closedCases.length})
              </h2>
              <div className="grid gap-4">
                {closedCases.map((c) => (
                  <CaseCard key={c.id} caseData={c} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </MainLayout>
  );
}
