import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, MapPin, FileText, FileEdit, CheckCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Hearing, Case } from '@/types/legal';
import { HearingStatusBadge } from './HearingStatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HEARING_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface HearingCardProps {
  hearing: Hearing;
  caseData: Case;
  onRecordResult?: () => void;
  onMarkPrepared?: () => void;
  showCaseInfo?: boolean;
}

export function HearingCard({ 
  hearing, 
  caseData, 
  onRecordResult, 
  onMarkPrepared,
  showCaseInfo = true 
}: HearingCardProps) {
  const navigate = useNavigate();
  
  // Une audience est urgente si elle est NON_RENSEIGNEE OU si sa date est passée
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hearingDate = new Date(hearing.date);
  hearingDate.setHours(0, 0, 0, 0);
  const isPastDate = hearingDate < today;
  
  const isUrgent = hearing.status === 'NON_RENSEIGNEE' || (isPastDate && hearing.status === 'A_VENIR');
  const isUpcoming = hearing.status === 'A_VENIR' && !isPastDate;

  return (
    <div 
      className={cn(
        "card-elevated p-4",
        isUrgent && "border-urgent/30 bg-urgent/5"
      )}
    >
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Date block */}
        <div className="flex md:flex-col items-center md:items-center gap-2 md:gap-0 md:w-20 flex-shrink-0">
          <div className={cn(
            "text-center px-3 py-2 rounded-lg",
            isUrgent ? "bg-urgent/10" : "bg-muted"
          )}>
            <p className={cn(
              "text-2xl font-bold font-serif",
              isUrgent ? "text-urgent" : "text-foreground"
            )}>
              {format(new Date(hearing.date), 'dd')}
            </p>
            <p className="text-xs text-muted-foreground uppercase">
              {format(new Date(hearing.date), 'MMM', { locale: fr })}
            </p>
          </div>
          {hearing.time && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {hearing.time}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Case info */}
          {showCaseInfo && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {caseData.reference}
              </span>
              <Badge variant="outline" className="text-xs">
                {HEARING_TYPE_LABELS[hearing.type]}
              </Badge>
              <HearingStatusBadge status={hearing.status} />
            </div>
          )}

          {!showCaseInfo && (
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {HEARING_TYPE_LABELS[hearing.type]}
              </Badge>
              <HearingStatusBadge status={hearing.status} />
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-foreground">
            {caseData.title}
          </h3>

          {/* Parties */}
          <p className="text-sm text-muted-foreground mt-1">
            {caseData.parties.filter(p => p.role === 'DEMANDEUR' || p.role === 'demandeur').map(p => p.nom || p.name).join(', ')} c/{' '}
            {caseData.parties.filter(p => p.role === 'DEFENDEUR' || p.role === 'defendeur').map(p => p.nom || p.name).join(', ')}
          </p>

          {/* Jurisdiction */}
          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{caseData.jurisdiction} • {caseData.chamber}</span>
          </div>

          {/* Preparation notes */}
          {hearing.preparationNotes && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <FileText className="h-3.5 w-3.5" />
                Notes de préparation
              </div>
              <p className="text-sm text-foreground">{hearing.preparationNotes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
          <Button 
            size="sm"
            variant="outline"
            onClick={() => navigate(`/audiences/${hearing.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Détails
          </Button>
          {isUrgent && onRecordResult && (
            <Button 
              size="sm"
              className="bg-urgent hover:bg-urgent/90 text-urgent-foreground"
              onClick={onRecordResult}
            >
              <FileEdit className="h-4 w-4 mr-1" />
              Renseigner
            </Button>
          )}
          {isUpcoming && onMarkPrepared && !hearing.isPrepared && (
            <Button 
              size="sm"
              variant="outline"
              onClick={onMarkPrepared}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Préparé
            </Button>
          )}
          {isUpcoming && hearing.isPrepared && (
            <Badge className="bg-success/10 text-success border-success/20">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Préparé
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
