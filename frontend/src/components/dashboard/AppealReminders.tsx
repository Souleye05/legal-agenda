import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Scale, Calendar, ArrowRight, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { AppealReminder } from '@/types/api';

export function AppealReminders() {
  const navigate = useNavigate();
  
  const { data: reminders = [] } = useQuery<AppealReminder[]>({
    queryKey: ['appeal-reminders'],
    queryFn: () => api.getAppealReminders(),
    refetchInterval: 60000,
  });

  const today = new Date();

  const getReminderStatus = (dateLimite: string) => {
    const deadline = new Date(dateLimite);
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    if (isPast(deadline) && !isToday(deadline)) {
      return 'expired';
    }
    if (isToday(deadline)) {
      return 'today';
    }
    const daysLeft = differenceInDays(deadline, today);
    if (daysLeft <= 3) {
      return 'urgent';
    }
    return 'upcoming';
  };

  // Show only urgent reminders (expired, today, or <= 3 days)
  const urgentReminders = reminders.filter((r) => {
    const status = getReminderStatus(r.dateLimite);
    return status === 'expired' || status === 'today' || status === 'urgent';
  });

  if (urgentReminders.length === 0) {
    return null;
  }

  // Show only first 3 reminders
  const displayedReminders = urgentReminders.slice(0, 3);

  return (
    <Card className="card-elevated">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Recours urgents
        </CardTitle>
        {urgentReminders.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/recours')}
            className="text-primary hover:text-primary/80"
          >
            Voir tout ({urgentReminders.length})
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedReminders.map((reminder) => {
          const status = getReminderStatus(reminder.dateLimite);
          const deadline = new Date(reminder.dateLimite);
          const daysLeft = differenceInDays(deadline, today);
          
          return (
            <div
              key={reminder.id}
              className="flex items-start justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => navigate('/recours')}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {reminder.affaire?.reference}
                  </span>
                  {status === 'expired' && (
                    <Badge className="bg-destructive text-destructive-foreground text-xs">
                      Expiré
                    </Badge>
                  )}
                  {status === 'today' && (
                    <Badge className="bg-urgent text-urgent-foreground text-xs">
                      Aujourd'hui
                    </Badge>
                  )}
                  {status === 'urgent' && (
                    <Badge className="bg-warning text-warning-foreground text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className="font-medium text-sm text-foreground truncate">
                  {reminder.affaire?.titre}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(deadline, 'dd MMM yyyy', { locale: fr })}</span>
                  {status !== 'expired' && <span>• {daysLeft} jour{daysLeft > 1 ? 's' : ''}</span>}
                </div>
              </div>
              <div className="flex items-center">
                {status === 'expired' && (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
              </div>
            </div>
          );
        })}
        
        {urgentReminders.length > 3 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/recours')}
          >
            Voir tous les recours ({urgentReminders.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
