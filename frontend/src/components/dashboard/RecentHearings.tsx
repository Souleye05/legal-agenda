import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { HEARING_TYPE_LABELS } from '@/lib/constants';

export function RecentHearings() {
  const navigate = useNavigate();

  const { data: hearingsData = [] } = useQuery({
    queryKey: ['hearings'],
    queryFn: () => api.getHearings(),
  });

  // Gérer le cas où l'API retourne un objet paginé ou un tableau
  const hearings = Array.isArray(hearingsData) ? hearingsData : (hearingsData as any).data || [];

  // Get next 5 upcoming hearings
  const upcomingHearings = hearings
    .filter((h: any) => h.statut === 'A_VENIR')
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="card-elevated">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Prochaines audiences</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-accent hover:text-accent"
          onClick={() => navigate('/agenda')}
        >
          Voir tout
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      <div className="divide-y divide-border">
        {upcomingHearings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucune audience à venir
          </div>
        ) : (
          upcomingHearings.map((hearing: any) => {
            const caseData = hearing.affaire;
            if (!caseData) return null;

            return (
              <div 
                key={hearing.id}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/affaires/${caseData.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {caseData.reference}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {HEARING_TYPE_LABELS[hearing.type] || hearing.type}
                      </Badge>
                    </div>
                    <p className="font-medium text-foreground truncate">
                      {caseData.titre}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {caseData.juridiction}
                      </span>
                      {hearing.heure && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {hearing.heure}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(hearing.date), 'dd MMM', { locale: fr })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(hearing.date), 'EEEE', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
