import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CaseCard } from '@/components/cases/CaseCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { api } from '@/lib/api';
import { useDebouncedValue } from '@/hooks/use-debounce';
import { DEBOUNCE_DELAYS } from '@/lib/constants';
import type { CaseStatus, Case } from '@/types/api';

const ITEMS_PER_PAGE = 10;

export default function Cases() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, DEBOUNCE_DELAYS.SEARCH);
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch cases from API
  const { data: casesData = [], isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => api.getCases(),
  });

  // Gérer le cas où l'API retourne un objet paginé ou un tableau
  const cases = Array.isArray(casesData) ? casesData : (casesData as any).data || [];

  // Transform API data to match frontend format
  const transformedCases = useMemo(() => {
    return cases.map((c: Case) => ({
      id: c.id,
      reference: c.reference,
      title: c.titre,
      parties: c.parties || [],
      jurisdiction: c.juridiction,
      chamber: c.chambre,
      city: c.ville,
      status: c.statut,
      observations: c.observations,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      createdBy: c.createdBy,
    }));
  }, [cases]);

  const filteredCases = useMemo(() => {
    return transformedCases.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.reference.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (c.parties && c.parties.some((p) => p.nom?.toLowerCase().includes(debouncedSearch.toLowerCase())));

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transformedCases, debouncedSearch, statusFilter]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNewCase = () => {
    navigate('/affaires/nouvelle');
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Affaires"
          description="Gérez vos dossiers et affaires en cours"
          action={{
            label: 'Nouvelle affaire',
            onClick: handleNewCase,
          }}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="🔍 Rechercher par référence, titre ou partie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Loading state */}
        {isLoading ? (
          <div className="card-elevated p-8 text-center text-muted-foreground">
            Chargement des affaires...
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="card-elevated p-8 text-center text-muted-foreground">
            Aucune affaire trouvée
          </div>
        ) : (
          /* Results */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedCases.map((c) => (
                <CaseCard key={c.id} caseData={c} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
