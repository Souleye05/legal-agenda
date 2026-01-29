import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Users, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Case } from '@/types/legal';
import { CaseStatusBadge } from './CaseStatusBadge';
import { HighlightText } from '@/components/ui/highlight-text';
import { api } from '@/lib/api';
import type { Hearing } from '@/types/api';

interface CaseCardProps {
  caseData: Case;
  searchQuery?: string;
}

export function CaseCard({ caseData, searchQuery = '' }: CaseCardProps) {
  const navigate = useNavigate();
  
  // Fetch hearings for this case
  const { data: hearingsData = [] } = useQuery({
    queryKey: ['hearings', caseData.id],
    queryFn: () => api.getHearings({ affaireId: caseData.id }),
  });
  
  // Gérer le cas où l'API retourne un objet paginé ou un tableau
  const hearings = Array.isArray(hearingsData) ? hearingsData : (hearingsData as any).data || [];
  
  const upcomingHearings = hearings.filter((h: Hearing) => h.statut === 'A_VENIR').length;

  const demandeurs = caseData.parties.filter(p => p.role === 'DEMANDEUR' || p.role === 'demandeur');
  const defendeurs = caseData.parties.filter(p => p.role === 'DEFENDEUR' || p.role === 'defendeur');

  return (
    <div 
      className="card-elevated p-4 cursor-pointer group"
      onClick={() => navigate(`/affaires/${caseData.id}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {caseData.reference}
            </span>
            <CaseStatusBadge status={caseData.status} />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            <HighlightText text={caseData.title} highlight={searchQuery} />
          </h3>

          {/* Parties */}
          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">
              <HighlightText 
                text={`${demandeurs.map(p => p.nom || p.name).join(', ')} c/ ${defendeurs.map(p => p.nom || p.name).join(', ')}`}
                highlight={searchQuery}
              />
            </span>
          </div>

          {/* Jurisdiction */}
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{caseData.jurisdiction} • {caseData.chamber}</span>
            {caseData.city && <span>• {caseData.city}</span>}
          </div>

          {/* Upcoming hearings */}
          {upcomingHearings > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <Calendar className="h-3.5 w-3.5 text-accent" />
              <span className="text-sm text-accent font-medium">
                {upcomingHearings} audience{upcomingHearings > 1 ? 's' : ''} à venir
              </span>
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>
    </div>
  );
}
