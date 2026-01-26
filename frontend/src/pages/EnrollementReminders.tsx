import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isToday, isBefore, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ClipboardList, Calendar, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { HEARING_TYPE_LABELS } from '@/lib/constants';
import { toast } from 'sonner';
import type { Hearing } from '@/types/api';

export default function EnrollmentReminders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch enrollment reminders from API
  const { data: reminders = [], isLoading } = useQuery<Hearing[]>({
    queryKey: ['enrollment-reminders'],
    queryFn: () => api.getEnrollmentReminders(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch completed enrollments
  const { data: completedReminders = [] } = useQuery<Hearing[]>({
    queryKey: ['completed-enrollments'],
    queryFn: () => api.getCompletedEnrollments(),
    refetchInterval: 60000,
  });

  // Mutation pour marquer comme effectué
  const markCompleteMutation = useMutation({
    mutationFn: (hearingId: string) => api.markEnrollmentComplete(hearingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['completed-enrollments'] });
      toast.success('Enrôlement marqué comme effectué');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  const today = new Date();

  const handleMarkComplete = (reminderId: string) => {
    markCompleteMutation.mutate(reminderId);
  };

  const getReminderStatus = (reminderDate: string) => {
    const date = new Date(reminderDate);
    if (isBefore(date, today) && !isToday(date)) {
      return 'overdue';
    }
    if (isToday(date)) {
      return 'today';
    }
    return 'upcoming';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Badge className="bg-urgent text-urgent-foreground">En retard</Badge>;
      case 'today':
        return <Badge className="bg-warning text-warning-foreground">Aujourd'hui</Badge>;
      default:
        return <Badge variant="secondary">À venir</Badge>;
    }
  };

  const pendingReminders = reminders;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
          <div className="card-elevated p-8 text-center text-muted-foreground">
            Chargement des rappels...
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PageHeader 
            title="Rappels enrôlement"
            description="Gérez vos rappels d'enrôlement pour les audiences à venir"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-urgent/10">
                <AlertCircle className="h-5 w-5 text-urgent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingReminders.filter(r => r.dateRappelEnrolement && getReminderStatus(r.dateRappelEnrolement) === 'overdue').length}</p>
                <p className="text-sm text-muted-foreground">En retard</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingReminders.filter(r => r.dateRappelEnrolement && getReminderStatus(r.dateRappelEnrolement) === 'today').length}</p>
                <p className="text-sm text-muted-foreground">Aujourd'hui</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedReminders.length}</p>
                <p className="text-sm text-muted-foreground">Effectués</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Reminders */}
        {pendingReminders.length > 0 ? (
          <Card className="card-elevated">
            <CardContent className="p-0">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-semibold flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Enrôlements à effectuer ({pendingReminders.length})
                </h3>
              </div>
              <div className="divide-y divide-border/50">
                {pendingReminders.map((reminder) => {
                  if (!reminder.dateRappelEnrolement) return null;
                  
                  const status = getReminderStatus(reminder.dateRappelEnrolement);
                  const hearingDate = new Date(reminder.date);
                  const daysUntilHearing = differenceInDays(hearingDate, today);
                  
                  return (
                    <div 
                      key={reminder.id}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              {reminder.affaire?.reference}
                            </span>
                            {getStatusBadge(status)}
                            <Badge variant="outline" className="text-xs">
                              {HEARING_TYPE_LABELS[reminder.type]}
                            </Badge>
                          </div>
                          <p className="font-medium text-foreground">
                            {reminder.affaire?.titre}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reminder.affaire?.juridiction} • {reminder.affaire?.chambre}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Audience le {format(hearingDate, 'dd MMMM yyyy', { locale: fr })}</span>
                              {reminder.heure && (
                                <span className="text-foreground font-medium">à {reminder.heure}</span>
                              )}
                            </div>
                            <span className={`font-medium ${daysUntilHearing <= 4 ? 'text-urgent' : 'text-muted-foreground'}`}>
                              J-{daysUntilHearing}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className={`text-sm font-medium ${status === 'overdue' ? 'text-urgent' : status === 'today' ? 'text-warning' : 'text-muted-foreground'}`}>
                            Rappel: {format(new Date(reminder.dateRappelEnrolement), 'dd/MM/yyyy', { locale: fr })}
                          </p>
                          <Button 
                            size="sm"
                            onClick={() => handleMarkComplete(reminder.id)}
                            disabled={markCompleteMutation.isPending}
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                            {markCompleteMutation.isPending ? 'En cours...' : 'Marquer effectué'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-elevated">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Tout est à jour</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Aucun enrôlement en attente
              </p>
            </CardContent>
          </Card>
        )}

        {/* Completed Enrollments Section */}
        {completedReminders.length > 0 && (
          <Card className="card-elevated opacity-75">
            <CardContent className="p-0">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Enrôlements effectués ({completedReminders.length})
                </h3>
              </div>
              <div className="divide-y divide-border/50">
                {completedReminders.map((reminder) => (
                  <div key={reminder.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-muted-foreground line-through">
                          {reminder.affaire?.titre}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Audience le {format(new Date(reminder.date), 'dd/MM/yyyy', { locale: fr })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Effectué
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
