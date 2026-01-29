import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CaseCard } from '@/components/cases/CaseCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
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
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, DEBOUNCE_DELAYS.SEARCH);
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');

  // Read search parameter from URL
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

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
    setPageInput('');
  }, [debouncedSearch, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Gestion de la saisie de page
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPageInput(value);
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setPageInput('');
    } else if (pageInput !== '') {
      setPageInput('');
    }
  };

  const handlePageInputBlur = () => {
    handlePageInputSubmit({ preventDefault: () => { } } as React.FormEvent);
  };

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
            <TabsList className="bg-muted/50 border-none h-10 p-1">
              <TabsTrigger value="all" className="text-sm px-4 h-8 transition-all duration-300 ease-out hover:scale-110 hover:translate-y-[-2px] hover:shadow-lg hover:bg-background/50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105 active:scale-95 active:translate-y-0">Toutes</TabsTrigger>
              <TabsTrigger value="ACTIVE" className="text-sm px-4 h-8 transition-all duration-300 ease-out hover:scale-110 hover:translate-y-[-2px] hover:shadow-lg hover:bg-background/50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105 active:scale-95 active:translate-y-0">Actives</TabsTrigger>
              <TabsTrigger value="CLOTUREE" className="text-sm px-4 h-8 transition-all duration-300 ease-out hover:scale-110 hover:translate-y-[-2px] hover:shadow-lg hover:bg-background/50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105 active:scale-95 active:translate-y-0">Clôturées</TabsTrigger>
              <TabsTrigger value="RADIEE" className="text-sm px-4 h-8 transition-all duration-300 ease-out hover:scale-110 hover:translate-y-[-2px] hover:shadow-lg hover:bg-background/50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md data-[state=active]:scale-105 active:scale-95 active:translate-y-0">Radiées</TabsTrigger>
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
                <CaseCard key={c.id} caseData={c} searchQuery={debouncedSearch} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Pagination principale */}
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={cn(
                          "transition-all duration-300 hover:scale-105 active:scale-95",
                          currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted hover:shadow-sm'
                        )}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-md data-[active=true]:scale-110"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={cn(
                          "transition-all duration-300 hover:scale-105 active:scale-95",
                          currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted hover:shadow-sm'
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                {/* Aller à la page */}
                <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Aller à la page</span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onBlur={handlePageInputBlur}
                    placeholder={currentPage.toString()}
                    className="w-16 h-9 text-center"
                  />
                  <span className="text-sm text-muted-foreground">/ {totalPages}</span>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
