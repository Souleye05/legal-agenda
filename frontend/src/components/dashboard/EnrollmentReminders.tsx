import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { HEARING_TYPE_LABELS } from '@/lib/constants';
import type { Hearing } from '@/types/api';

export function EnrollmentReminders() {
  const navigate = useNavigate();
  
  const { data: reminders = [] } = useQuery<Hearing[]>({
    queryKey: ['enrollment-reminders'],
    queryFn: () => api.getEnrollmentReminders(),
    refetchInterval: 60000, // Refresh every minute
  });

  const today = new Date();

  if (reminders.length === 0) {
    return null;
  }

  // Show only first 3 reminders
  const displayedReminders = reminders.slice(0, 3);

  return (
    <Card className="card-elevated">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Rappels d'enrôlement
        </CardTitle>
        {reminders.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/rappels-enrolement')}
            className="text-primary hover:text-primary/80"
          >
            Voir tout ({reminders.length})
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedReminders.map((reminder) => {
          if (!reminder.dateRappelEnrolement) return null;
          
          const hearingDate = new Date(reminder.date);
          const daysUntilHearing = differenceInDays(hearingDate, today);
          
          return (
            <div
              key={reminder.id}
              className="flex items-start justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/audiences/${reminder.id}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {reminder.affaire?.reference}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {HEARING_TYPE_LABELS[reminder.type]}
                  </Badge>
                </div>
                <p className="font-medium text-sm text-foreground truncate">
                  {reminder.affaire?.titre}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(hearingDate, 'dd MMM yyyy', { locale: fr })}</span>
                  {reminder.heure && <span>• {reminder.heure}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge 
                  className={`text-xs ${
                    daysUntilHearing <= 2 
                      ? 'bg-urgent text-urgent-foreground' 
                      : daysUntilHearing <= 4 
                      ? 'bg-warning text-warning-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  J-{daysUntilHearing}
                </Badge>
              </div>
            </div>
          );
        })}
        
        {reminders.length > 3 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/rappels-enrolement')}
          >
            Voir tous les rappels ({reminders.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
