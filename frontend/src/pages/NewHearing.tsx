import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CreateCaseDialog } from '@/components/cases/CreateCaseDialog';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, ArrowLeft, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { HEARING_TYPE_LABELS } from '@/lib/constants';
import { createHearingSchema, type CreateHearingFormData } from '@/lib/validations';
import type { Case, HearingType } from '@/types/api';

export default function NewHearing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const preselectedCaseId = searchParams.get('affaireId');
  const preselectedDate = searchParams.get('date');
  const [showCreateCaseDialog, setShowCreateCaseDialog] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateHearingFormData>({
    resolver: zodResolver(createHearingSchema),
    defaultValues: {
      affaireId: preselectedCaseId || '',
      date: preselectedDate ? new Date(preselectedDate) : undefined,
      heure: '',
      type: '' as HearingType,
      notesPreparation: '',
      rappelEnrolement: true,
    },
  });

  const [openCaseCombobox, setOpenCaseCombobox] = useState(false);
  const [caseSearchQuery, setCaseSearchQuery] = useState('');

  // Fetch active cases
  const { data: cases = [], isLoading } = useQuery<Case[]>({
    queryKey: ['cases'],
    queryFn: () => api.getCases(),
  });

  const activeCases = cases.filter((c) => c.statut === 'ACTIVE');

  const createHearingMutation = useMutation({
    mutationFn: (data: CreateHearingFormData) => {
      return api.createHearing({
        affaireId: data.affaireId,
        date: data.date.toISOString(),
        heure: data.heure || undefined,
        type: data.type,
        notesPreparation: data.notesPreparation || undefined,
        rappelEnrolement: data.rappelEnrolement,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hearings'] });
      toast({
        title: "Audience créée",
        description: "L'audience a été créée avec succès",
      });
      navigate('/agenda');
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'audience",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateHearingFormData) => {
    createHearingMutation.mutate(data);
  };

  const handleCaseCreated = (caseId: string) => {
    // Refresh cases list
    queryClient.invalidateQueries({ queryKey: ['cases'] });
    // Auto-select the newly created case
    setValue('affaireId', caseId, { shouldValidate: true });
    toast({
      title: "Affaire sélectionnée",
      description: "L'affaire créée a été automatiquement sélectionnée",
    });
  };

  // Fonction pour obtenir le texte de recherche d'une affaire
  const getCaseSearchText = (caseItem: Case): string => {
    const parties = caseItem.parties
      ?.map((p) => p.nom)
      .join(' ')
      .toLowerCase() || '';
    return `${caseItem.reference} ${caseItem.titre} ${parties}`.toLowerCase();
  };

  // Filtrer les affaires selon la recherche
  const filteredCases = activeCases.filter((c) => {
    if (!caseSearchQuery) return true;
    const searchText = getCaseSearchText(c);
    return searchText.includes(caseSearchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div>
          <div className="card-elevated p-8 text-center text-muted-foreground">
            Chargement...
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PageHeader
            title="Nouvelle audience"
            description="Planifier une nouvelle audience"
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Informations de l'audience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Affaire avec Combobox recherche */}
              <div className="space-y-2">
                <Label htmlFor="affaireId">Affaire liée *</Label>
                <div className="flex gap-2">
                  <Controller
                    name="affaireId"
                    control={control}
                    render={({ field }) => {
                      const selectedCase = activeCases.find((c) => c.id === field.value);
                      return (
                        <Popover open={openCaseCombobox} onOpenChange={setOpenCaseCombobox}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCaseCombobox}
                              className="flex-1 justify-between"
                            >
                              {selectedCase ? (
                                <div className="flex flex-col items-start text-left">
                                  <span className="font-medium">{selectedCase.titre}</span>
                                  <span className="text-xs text-muted-foreground">{selectedCase.reference}</span>
                                </div>
                              ) : (
                                "Rechercher une affaire..."
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[500px] p-0" align="start">
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
                                        field.onChange(c.id);
                                        setOpenCaseCombobox(false);
                                        setCaseSearchQuery('');
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === c.id ? "opacity-100" : "opacity-0"
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
                      );
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowCreateCaseDialog(true)}
                    title="Créer une nouvelle affaire"
                  >
                    <span className="text-lg mr-1">+</span>
                  </Button>
                </div>
                {errors.affaireId && (
                  <p className="text-sm text-destructive">{errors.affaireId.message}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Date de l'audience *</Label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP', { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>

              {/* Heure */}
              <div className="space-y-2">
                <Label htmlFor="heure">Heure (optionnel)</Label>
                <Input
                  id="heure"
                  type="time"
                  {...register('heure')}
                />
                {errors.heure && (
                  <p className="text-sm text-destructive">{errors.heure.message}</p>
                )}
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>Type d'audience *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(HEARING_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              {/* Notes de préparation */}
              <div className="space-y-2">
                <Label htmlFor="notesPreparation">Notes de préparation</Label>
                <Textarea
                  id="notesPreparation"
                  placeholder="Points à préparer, documents à apporter..."
                  {...register('notesPreparation')}
                  rows={4}
                />
                {errors.notesPreparation && (
                  <p className="text-sm text-destructive">{errors.notesPreparation.message}</p>
                )}
              </div>

              {/* Rappel d'enrôlement */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="rappelEnrolement"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="rappelEnrolement"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor="rappelEnrolement"
                  className="text-sm font-normal cursor-pointer"
                >
                  Rappel d'enrôlement (4 jours ouvrables avant l'audience)
                </Label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(-1)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || createHearingMutation.isPending}
                >
                  {isSubmitting || createHearingMutation.isPending ? 'Création...' : 'Créer l\'audience'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Dialog pour créer une affaire */}
        <CreateCaseDialog
          open={showCreateCaseDialog}
          onOpenChange={setShowCreateCaseDialog}
          onCaseCreated={handleCaseCreated}
        />
      </div>
    </MainLayout>
  );
}
