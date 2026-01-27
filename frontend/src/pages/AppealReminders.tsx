import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays, isPast, isToday, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Scale, Calendar as CalendarIcon, CheckCircle2, Clock, AlertTriangle, Plus, Briefcase, Timer, Check } from 'lucide-react';
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
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AppealReminder, Case } from '@/types/api';
import { ChevronsUpDown } from 'lucide-react';

export default function AppealReminders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [deliberationDate, setDeliberationDate] = useState<Date>();
  const [appealDeadlineDays, setAppealDeadlineDays] = useState(10);
  const [notes, setNotes] = useState('');
  const [openCaseCombobox, setOpenCaseCombobox] = useState(false);
  const [caseSearchQuery, setCaseSearchQuery] = useState('');

  // Fetch appeal reminders
  const { data: remindersData = [], isLoading } = useQuery({
    queryKey: ['appeal-reminders'],
    queryFn: () => api.getAppealReminders(),
    refetchInterval: 60000,
  });

  const reminders = Array.isArray(remindersData) ? remindersData : (remindersData as any).data || [];

  // Fetch cases for selection
  const { data: casesData = [] } = useQuery({
    queryKey: ['cases'],
    queryFn: () => api.getCases(),
  });

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
      setDeliberationDate(undefined);
      setAppealDeadlineDays(10);
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
      toast.success('Recours marqué comme effectué');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });

  const handleCreate = () => {
    if (!selectedCaseId || !deliberationDate) {
      toast.error('Veuillez sélectionner une affaire et une date de délibéré');
      return;
    }

    const deadlineDate = addDays(deliberationDate, appealDeadlineDays);

    createMutation.mutate({
      affaireId: selectedCaseId,
      dateLimite: deadlineDate.toISOString(),
      notes: notes || undefined,
    });
  };

  const handleMarkComplete = (id: string) => {
    markCompleteMutation.mutate(id);
  };

  const getDaysRemaining = (dateLimite: string) => {
    const deadline = new Date(dateLimite);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    return differenceInDays(deadline, today);
  };

  const getUrgencyBadge = (daysRemaining: number) => {
    if (daysRemaining < 0) {
      return (
        <Badge variant="destructive" className="bg-urgent text-urgent-foreground animate-pulse">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Délai dépassé ({Math.abs(daysRemaining)}j)
        </Badge>
      );
    }
    if (daysRemaining <= 2) {
      return (
        <Badge variant="destructive" className="bg-urgent text-urgent-foreground">
          <Clock className="h-3 w-3 mr-1" />
          {daysRemaining}j restant{daysRemaining > 1 ? 's' : ''}
        </Badge>
      );
    }
    if (daysRemaining <= 5) {
      return (
        <Badge className="bg-warning text-warning-foreground">
          <Clock className="h-3 w-3 mr-1" />
          {daysRemaining}j restants
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        {daysRemaining}j restants
      </Badge>
    );
  };

  const deadlineDate = deliberationDate ? addDays(deliberationDate, appealDeadlineDays) : null;

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

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Recours à faire"
          description="Suivez les délais de recours après délibéré"
          action={{
            label: 'Nouveau rappel',
            onClick: () => setShowCreateDialog(true),
          }}
        />

        {reminders.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Scale className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucun recours en attente</h3>
              <p className="text-muted-foreground mb-4">
                Tous vos recours ont été traités ou aucun n'est programmé.
              </p>
              <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un rappel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-2 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
              <p className="text-sm text-foreground">
                <strong>{reminders.length} recours</strong> en attente. Ce rappel s'affichera chaque jour jusqu'à ce que le recours soit effectué.
              </p>
            </div>

            <div className="space-y-4">
              {reminders.map((reminder) => {
                const daysRemaining = getDaysRemaining(reminder.dateLimite);
                return (
                  <Card
                    key={reminder.id}
                    className={cn(
                      'card-elevated transition-all duration-200',
                      daysRemaining < 0 && 'border-urgent/50 bg-urgent/5',
                      daysRemaining >= 0 && daysRemaining <= 2 && 'border-urgent/30 bg-urgent/5',
                      daysRemaining > 2 && daysRemaining <= 5 && 'border-warning/30 bg-warning/5'
                    )}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                                daysRemaining < 0
                                  ? 'bg-urgent/20'
                                  : daysRemaining <= 5
                                  ? 'bg-warning/20'
                                  : 'bg-primary/10'
                              )}
                            >
                              <Scale
                                className={cn(
                                  'h-5 w-5',
                                  daysRemaining < 0
                                    ? 'text-urgent'
                                    : daysRemaining <= 5
                                    ? 'text-warning'
                                    : 'text-primary'
                                )}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {reminder.affaire?.titre || 'Affaire inconnue'}
                              </h3>
                              <p className="text-sm text-muted-foreground">{reminder.affaire?.reference}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Délibéré rendu le:</span>
                              <p className="font-medium">
                                {reminder.dateDelibere
                                  ? format(new Date(reminder.dateDelibere), 'd MMMM yyyy', { locale: fr })
                                  : 'Non renseigné'}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date limite recours:</span>
                              <p className="font-medium text-primary">
                                {format(new Date(reminder.dateLimite), 'd MMMM yyyy', { locale: fr })}
                              </p>
                            </div>
                          </div>

                          {reminder.notes && (
                            <p className="text-sm text-muted-foreground italic border-l-2 border-muted pl-3">
                              {reminder.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          {getUrgencyBadge(daysRemaining)}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/affaires/${reminder.affaire?.id}`)}
                            >
                              <Briefcase className="h-4 w-4 mr-1" />
                              Voir l'affaire
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleMarkComplete(reminder.id)}
                              disabled={markCompleteMutation.isPending}
                              className="bg-success hover:bg-success/90"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Effectué
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-serif flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Ajouter un rappel de recours
              </DialogTitle>
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
                <Label>Date du délibéré *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !deliberationDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliberationDate ? format(deliberationDate, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deliberationDate}
                      onSelect={setDeliberationDate}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Délai de recours (jours)</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={appealDeadlineDays}
                  onChange={(e) => setAppealDeadlineDays(parseInt(e.target.value) || 10)}
                />
                <p className="text-xs text-muted-foreground">Par défaut: 10 jours</p>
              </div>

              {deadlineDate && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Date limite de recours:</span>
                  </div>
                  <p className="text-lg font-semibold mt-1">
                    {format(deadlineDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Notes (optionnel)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observations sur le délibéré, raisons du recours..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
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
                  disabled={createMutation.isPending || !selectedCaseId || !deliberationDate}
                >
                  {createMutation.isPending ? 'Création...' : 'Ajouter le rappel'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
