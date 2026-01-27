import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Scale, Calendar, ArrowLeft, CheckCircle2, Clock, AlertTriangle, Plus } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AppealReminder, Case } from '@/types/api';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';

export default function AppealReminders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [deadline, setDeadline] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [openCaseCombobox, setOpenCaseCombobox] = useState(false);
  const [caseSearchQuery, setCaseSearchQuery] = useState('');

  // Fetch appeal reminders
  const { data: remindersData = [], isLoading } = useQuery({
    queryKey: ['appeal-reminders'],
    queryFn: () => api.getAppealReminders(),
    refetchInterval: 60000,
  });

  // Gérer le cas où l'API retourne un objet paginé ou un tableau
  const reminders = Array.isArray(remindersData) ? remindersData : (remindersData as any).data || [];

  // Fetch completed reminders
  const { data: completedReminders = [] } = useQuery<AppealReminder[]>({
    queryKey: ['completed-appeal-reminders'],
    queryFn: () => api.getCompletedAppealReminders(),
    refetchInterval: 60000,
  });

  // Fetch cases for selection
  const { data: casesData = [] } = useQuery({
    queryKey: ['cases'],
    queryFn: () => api.getCases(),
  });

  // Gérer le cas où l'API retourne un objet paginé ou un tableau
  const cases = Array.isArray(casesData) ? casesData : (casesData as any).data || [];

  const activeCases = cases.filter((c: Case) => c.statut === 'ACTIVE' || c.statut === 'CLOTUREE');

  // Filter cases based on search
  const getCaseSearchText = (caseItem: Case): string => {
    const parties = caseItem.parties
      ?.map((p) => p.nom)
      .join(' ')
      .toLowerCase() || '';
    return `${caseItem.reference} ${caseItem.titre} ${parties}`.toLowerCase();
  };

  const filteredCases = activeCases.filter((c) => {
    if (!caseSearchQuery) return true;
    const searchText = getCaseSearchText(c);
    return searchText.includes(caseSearchQuery.toLowerCase());
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { affaireId: string; dateLimite: string; notes?: string }) =>
      api.createAppealReminder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeal-reminders'] });
      toast.success('Rappel de recours créé');
      setShowCreateDialog(false);
      setSelectedCaseId('');
      setDeadline(undefined);
      setNotes('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });

  // Mark complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: (id: string) => api.markAppealReminderComplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appeal-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['completed-appeal-reminders'] });
      toast.success('Recours marqué comme effectué');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  const handleCreate = () => {
    if (!selectedCaseId || !deadline) {
      toast.error('Veuillez sélectionner une affaire et une date limite');
      return;
    }

    createMutation.mutate({
      affaireId: selectedCaseId,
      dateLimite: deadline.toISOString(),
      notes: notes || undefined,
    });
  };

  const handleMarkComplete = (id: string) => {
    markCompleteMutation.mutate(id);
  };

  const getReminderStatus = (dateLimite: string) => {
    const deadline = new Date(dateLimite);
    const today = new Date();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expired':
        return <Badge className="bg-destructive text-destructive-foreground">Expiré</Badge>;
      case 'today':
        return <Badge className="bg-urgent text-urgent-foreground">Aujourd'hui</Badge>;
      case 'urgent':
        return <Badge className="bg-warning text-warning-foreground">Urgent</Badge>;
      default:
        return <Badge variant="secondary">À venir</Badge>;
    }
  };

  const getDaysLeftText = (dateLimite: string) => {
    const deadline = new Date(dateLimite);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    if (isToday(deadline)) {
      return "Aujourd'hui";
    }

    const daysLeft = differenceInDays(deadline, today);

    if (daysLeft < 0) {
      return `Expiré depuis ${Math.abs(daysLeft)} jour${Math.abs(daysLeft) > 1 ? 's' : ''}`;
    }

    return `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div>
          <div className="card-elevated p-8 text-center text-muted-foreground">
            Chargement des rappels...
          </div>
        </div>
      </MainLayout>
    );
  }

  const expiredReminders = reminders.filter((r) => getReminderStatus(r.dateLimite) === 'expired');
  const todayReminders = reminders.filter((r) => getReminderStatus(r.dateLimite) === 'today');
  const urgentReminders = reminders.filter((r) => getReminderStatus(r.dateLimite) === 'urgent');

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <PageHeader
              title="Recours à faire"
              description="Gérez vos rappels de recours après délibéré"
            />
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau rappel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer un rappel de recours</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Affaire *</Label>
                  <Popover open={openCaseCombobox} onOpenChange={setOpenCaseCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCaseCombobox}
                        className="w-full justify-between"
                      >
                        {selectedCaseId ? (
                          <div className="flex flex-col items-start text-left">
                            <span className="font-medium">
                              {activeCases.find((c) => c.id === selectedCaseId)?.titre}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {activeCases.find((c) => c.id === selectedCaseId)?.reference}
                            </span>
                          </div>
                        ) : (
                          'Rechercher une affaire...'
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[460px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Rechercher par référence, titre ou parties..."
                          value={caseSearchQuery}
                          onValueChange={setCaseSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>Aucune affaire trouvée.</CommandEmpty>
                          <CommandGroup>
                            {filteredCases.map((c) => (
                              <CommandItem
                                key={c.id}
                                value={c.id}
                                onSelect={() => {
                                  setSelectedCaseId(c.id);
                                  setOpenCaseCombobox(false);
                                  setCaseSearchQuery('');
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedCaseId === c.id ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                <div className="flex flex-col flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{c.titre}</span>
                                    <span className="text-xs text-muted-foreground">({c.reference})</span>
                                  </div>
                                  {c.parties && c.parties.length > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      {c.parties.map((p) => p.nom).join(' • ')}
                                    </span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Date limite *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !deadline && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={deadline}
                        onSelect={setDeadline}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    Délai par défaut : 10 jours après le délibéré
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Informations complémentaires sur le recours..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div >

        {/* Summary Cards */}
        < div className="grid grid-cols-1 md:grid-cols-3 gap-4" >
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiredReminders.length}</p>
                <p className="text-sm text-muted-foreground">Expirés</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-urgent/10">
                <Clock className="h-5 w-5 text-urgent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayReminders.length + urgentReminders.length}</p>
                <p className="text-sm text-muted-foreground">Urgents</p>
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
        </div >

        {/* Active Reminders */}
        {
          reminders.length > 0 ? (
            <Card className="card-elevated">
              <CardContent className="p-0">
                <div className="p-4 border-b border-border/50">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    Recours à effectuer ({reminders.length})
                  </h3>
                </div>
                <div className="divide-y divide-border/50">
                  {reminders.map((reminder) => {
                    const status = getReminderStatus(reminder.dateLimite);
                    const daysLeftText = getDaysLeftText(reminder.dateLimite);

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
                            </div>
                            <p className="font-medium text-foreground">
                              {reminder.affaire?.titre}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {reminder.affaire?.juridiction} • {reminder.affaire?.chambre}
                            </p>
                            {reminder.notes && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                {reminder.notes}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Date limite: {format(new Date(reminder.dateLimite), 'dd MMMM yyyy', { locale: fr })}
                                </span>
                              </div>
                              <span
                                className={`font-medium ${status === 'expired'
                                  ? 'text-destructive'
                                  : status === 'today' || status === 'urgent'
                                    ? 'text-urgent'
                                    : 'text-muted-foreground'
                                  }`}
                              >
                                {daysLeftText}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
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
                  Aucun recours en attente
                </p>
              </CardContent>
            </Card>
          )
        }

        {/* Completed Reminders */}
        {
          completedReminders.length > 0 && (
            <Card className="card-elevated opacity-75">
              <CardContent className="p-0">
                <div className="p-4 border-b border-border/50">
                  <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Recours effectués ({completedReminders.length})
                  </h3>
                </div>
                <div className="divide-y divide-border/50">
                  {completedReminders.slice(0, 10).map((reminder) => (
                    <div key={reminder.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-muted-foreground line-through">
                            {reminder.affaire?.titre}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Effectué le{' '}
                            {reminder.dateEffectue &&
                              format(new Date(reminder.dateEffectue), 'dd/MM/yyyy', { locale: fr })}
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
          )
        }
      </div >
    </MainLayout >
  );
}
