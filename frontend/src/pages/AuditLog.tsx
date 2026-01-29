import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FileText, 
  User, 
  Calendar, 
  Scale, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  Trash2,
  Filter,
  Download
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { AuditLog } from '@/types/api';

const ITEMS_PER_PAGE = 20;

// Mapping des actions vers des icônes et couleurs
const ACTION_CONFIG = {
  CREATION: {
    icon: Plus,
    label: 'Création',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  MODIFICATION: {
    icon: Edit,
    label: 'Modification',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  SUPPRESSION: {
    icon: Trash2,
    label: 'Suppression',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

// Mapping des types d'entités vers des icônes
const ENTITY_ICONS = {
  Affaire: Scale,
  Audience: Calendar,
  ResultatAudience: CheckCircle,
  RappelRecours: AlertCircle,
  Utilisateur: User,
};

// Labels français pour les entités
const ENTITY_LABELS: Record<string, string> = {
  Affaire: 'Affaire',
  Audience: 'Audience',
  ResultatAudience: 'Résultat d\'audience',
  RappelRecours: 'Rappel de recours',
  Utilisateur: 'Utilisateur',
};

export default function AuditLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');

  // Fetch audit logs
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => api.getAuditLogs(200), // Récupérer les 200 dernières entrées
  });

  // Filtrer les logs
  const filteredLogs = logs.filter((log: AuditLog) => {
    const matchesSearch = 
      log.utilisateur.nomComplet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.utilisateur.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.typeEntite.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.typeEntite === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  // Obtenir les types d'entités uniques
  const uniqueEntities = Array.from(new Set(logs.map((log: AuditLog) => log.typeEntite)));

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setPageInput('');
  }, [searchQuery, actionFilter, entityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Gestion de la saisie de page
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Autoriser uniquement les chiffres
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
      // Page invalide, réinitialiser
      setPageInput('');
    }
  };

  const handlePageInputBlur = () => {
    handlePageInputSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  // Fonction pour formater l'action en texte lisible
  const getActionText = (log: AuditLog) => {
    const action = ACTION_CONFIG[log.action].label.toLowerCase();
    const entity = ENTITY_LABELS[log.typeEntite] || log.typeEntite;
    
    // Cas spéciaux pour les actions utilisateur
    if (log.typeEntite === 'Utilisateur' && log.nouvelleValeur) {
      try {
        const value = JSON.parse(log.nouvelleValeur);
        if (value.action === 'LOGIN_SUCCESS') return 'Connexion réussie';
        if (value.action === 'LOGIN_FAILED') return 'Tentative de connexion échouée';
        if (value.action === 'LOGOUT') return 'Déconnexion';
      } catch (e) {
        // Ignore parsing errors
      }
    }

    return `${action} d'${entity}`;
  };

  // Fonction pour obtenir des détails supplémentaires
  const getDetails = (log: AuditLog) => {
    if (!log.nouvelleValeur) return null;

    try {
      const value = JSON.parse(log.nouvelleValeur);
      
      // Pour les connexions
      if (value.action === 'LOGIN_SUCCESS' && value.ip) {
        return `IP: ${value.ip}`;
      }
      
      // Pour les autres actions, on peut extraire des infos pertinentes
      if (value.reference) return `Réf: ${value.reference}`;
      if (value.titre) return value.titre;
      if (value.date) return `Date: ${format(new Date(value.date), 'dd/MM/yyyy', { locale: fr })}`;
      
    } catch (e) {
      // Ignore parsing errors
    }
    
    return null;
  };

  const handleExport = () => {
    // Créer un CSV simple
    const headers = ['Date', 'Heure', 'Utilisateur', 'Action', 'Entité'];
    const rows = filteredLogs.map((log: AuditLog) => [
      format(new Date(log.createdAt), 'dd/MM/yyyy', { locale: fr }),
      format(new Date(log.createdAt), 'HH:mm:ss', { locale: fr }),
      log.utilisateur.nomComplet,
      ACTION_CONFIG[log.action].label,
      ENTITY_LABELS[log.typeEntite] || log.typeEntite,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `journal-audit-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Journal d'Audit"
          description="Historique de toutes les actions effectuées dans l'application"
          action={{
            label: 'Exporter CSV',
            onClick: handleExport,
            icon: <Download className="h-4 w-4" />,
          }}
        />

        {/* Filtres */}
        <div className="card-elevated p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <Input
                placeholder="🔍 Rechercher par utilisateur ou entité..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filtre par action */}
            <Tabs value={actionFilter} onValueChange={setActionFilter}>
              <TabsList>
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="CREATION">Créations</TabsTrigger>
                <TabsTrigger value="MODIFICATION">Modifications</TabsTrigger>
                <TabsTrigger value="SUPPRESSION">Suppressions</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filtre par entité */}
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type d'entité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entités</SelectItem>
                {uniqueEntities.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    {ENTITY_LABELS[entity] || entity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Compteur */}
          <div className="text-sm text-muted-foreground">
            {filteredLogs.length} entrée{filteredLogs.length > 1 ? 's' : ''} trouvée{filteredLogs.length > 1 ? 's' : ''}
            {totalPages > 1 && ` • Page ${currentPage} sur ${totalPages}`}
          </div>
        </div>

        {/* Liste des logs */}
        {isLoading ? (
          <div className="card-elevated p-8 text-center text-muted-foreground">
            Chargement du journal...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="card-elevated p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune entrée trouvée</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedLogs.map((log: AuditLog) => {
              const actionConfig = ACTION_CONFIG[log.action];
              const ActionIcon = actionConfig.icon;
              const EntityIcon = ENTITY_ICONS[log.typeEntite] || FileText;
              const details = getDetails(log);

              return (
                <div
                  key={log.id}
                  className={`card-elevated p-4 border-l-4 ${actionConfig.borderColor} hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icône d'action */}
                    <div className={`p-3 rounded-xl ${actionConfig.bgColor}`}>
                      <ActionIcon className={`h-5 w-5 ${actionConfig.color}`} />
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          {/* Action et entité */}
                          <div className="flex items-center gap-2 mb-1">
                            <EntityIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-foreground">
                              {getActionText(log)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {ENTITY_LABELS[log.typeEntite] || log.typeEntite}
                            </Badge>
                          </div>

                          {/* Détails supplémentaires */}
                          {details && (
                            <p className="text-sm text-muted-foreground truncate">
                              {details}
                            </p>
                          )}

                          {/* Utilisateur */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                              {log.utilisateur.nomComplet.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {log.utilisateur.nomComplet}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({log.utilisateur.email})
                            </span>
                          </div>
                        </div>

                        {/* Date et heure */}
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold text-foreground">
                            {format(new Date(log.createdAt), 'HH:mm:ss', { locale: fr })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(log.createdAt), 'dd MMM yyyy', { locale: fr })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Pagination principale */}
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
