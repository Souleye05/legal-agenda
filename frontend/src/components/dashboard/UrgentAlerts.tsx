import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, ArrowRight, FileEdit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getUnreportedHearings, hearingTypeLabels } from '@/lib/mock-data';

export function UrgentAlerts() {
  const navigate = useNavigate();
  const unreportedHearings = getUnreportedHearings();

  if (unreportedHearings.length === 0) {
    return null;
  }

  return (
    <div className="card-elevated border-urgent/30 bg-urgent/5">
      <div className="p-4 border-b border-urgent/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-urgent" />
          <h3 className="font-semibold text-foreground">Audiences à renseigner</h3>
          <span className="px-2 py-0.5 rounded-full bg-urgent text-urgent-foreground text-xs font-medium">
            {unreportedHearings.length}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-urgent hover:text-urgent hover:bg-urgent/10"
          onClick={() => navigate('/a-renseigner')}
        >
          Tout voir
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      <div className="divide-y divide-urgent/10">
        {unreportedHearings.slice(0, 3).map((hearing) => (
          <div 
            key={hearing.id}
            className="p-4 hover:bg-urgent/5 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {hearing.case.reference}
                  </span>
                  <span className="text-xs text-urgent font-medium">
                    {hearingTypeLabels[hearing.type]}
                  </span>
                </div>
                <p className="font-medium text-foreground truncate">
                  {hearing.case.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {hearing.case.jurisdiction} • {hearing.case.chamber}
                </p>
              </div>
              <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                <div>
                  <p className="text-sm font-medium text-urgent">
                    {format(new Date(hearing.date), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Il y a {Math.floor((new Date().getTime() - new Date(hearing.date).getTime()) / (1000 * 60 * 60 * 24))} jours
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-urgent/30 text-urgent hover:bg-urgent hover:text-urgent-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/a-renseigner?hearing=${hearing.id}`);
                  }}
                >
                  <FileEdit className="h-3.5 w-3.5 mr-1" />
                  Renseigner
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
