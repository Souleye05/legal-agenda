import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, RotateCcw, XCircle, Scale, CalendarIcon } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { HearingResultType } from '@/types/legal';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function RecordHearingResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [hearing, setHearing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [resultType, setResultType] = useState<HearingResultType>('RENVOI');
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');
  const [createAppealReminder, setCreateAppealReminder] = useState(true);
  const [appealDeadline, setAppealDeadline] = useState<Date | undefined>();
  const [appealNotes, setAppealNotes] = useState('');

  useEffect(() => {
    loadHearing();
  }, [id]);

  // Set default appeal deadline when result type changes to DELIBERE
  useEffect(() => {
    if (resultType === 'DELIBERE' && !appealDeadline) {
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 10);
      setAppealDeadline(defaultDeadline);
    }
  }, [resultType]);

  const loadHearing = async () => {
    try {
      setLoading(true);
      const hearing: any = await api.get(`/hearings/${id}`);
      setHearing(hearing);

      if (hearing.resultat) {
        toast({
          title: 'Attention',
          description: 'Cette audience a déjà un résultat enregistré',
          variant: 'destructive',
        });
        navigate(`/audiences/${id}`);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de charger l\'audience',
        variant: 'destructive',
      });
      navigate('/a-renseigner');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    setIsSubmitting(true);
    try {
      const data: any = { type: resultType };

      if (resultType === 'RENVOI') {
        if (!newDate || !reason) {
          toast({
            title: 'Erreur',
            description: 'Veuillez remplir tous les champs obligatoires',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
        data.nouvelleDate = newDate.toISOString();
        data.motifRenvoi = reason;
      } else if (resultType === 'RADIATION') {
        if (!reason) {
          toast({
            title: 'Erreur',
            description: 'Veuillez remplir le motif de radiation',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
        data.motifRadiation = reason;
      } else if (resultType === 'DELIBERE') {
        if (!reason) {
          toast({
            title: 'Erreur',
            description: 'Veuillez remplir le texte du délibéré',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
        data.texteDelibere = reason;
        if (createAppealReminder && appealDeadline) {
          data.creerRappelRecours = true;
          data.dateLimiteRecours = appealDeadline.toISOString();
          data.notesRecours = appealNotes || undefined;
        }
      }

      await api.recordHearingResult(id, data);

      toast({
        title: 'Succès',
        description: 'Le résultat a été enregistré avec succès',
      });

      navigate(`/audiences/${id}`);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible d\'enregistrer le résultat',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </MainLayout>
    );
  }

  if (!hearing) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <PageHeader
            title="Renseigner le résultat"
            description="Enregistrez le résultat de l'audience"
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="p-4 bg-muted rounded-lg mb-6">
              <p className="font-medium">{hearing.affaire?.titre}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {hearing.affaire?.reference} • {format(new Date(hearing.date), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Type de résultat *</Label>
                <RadioGroup
                  value={resultType}
                  onValueChange={(v) => setResultType(v as HearingResultType)}
                  className="grid grid-cols-3 gap-3"
                >
                  <Label
                    htmlFor="renvoi"
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                      resultType === 'RENVOI' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value="RENVOI" id="renvoi" className="sr-only" />
                    <RotateCcw className="h-5 w-5" />
                    <span className="text-sm font-medium">Renvoi</span>
                  </Label>
                  <Label
                    htmlFor="radiation"
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                      resultType === 'RADIATION' ? "border-destructive bg-destructive/5" : "border-border hover:border-destructive/50"
                    )}
                  >
                    <RadioGroupItem value="RADIATION" id="radiation" className="sr-only" />
                    <XCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Radiation</span>
                  </Label>
                  <Label
                    htmlFor="delibere"
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                      resultType === 'DELIBERE' ? "border-success bg-success/5" : "border-border hover:border-success/50"
                    )}
                  >
                    <RadioGroupItem value="DELIBERE" id="delibere" className="sr-only" />
                    <Scale className="h-5 w-5" />
                    <span className="text-sm font-medium">Délibéré</span>
                  </Label>
                </RadioGroup>
              </div>

              {resultType === 'RENVOI' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nouvelle date d'audience *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newDate ? format(newDate, 'PPP', { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newDate}
                          onSelect={setNewDate}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Motif du renvoi *</Label>
                    <Textarea
                      placeholder="Ex: Conclusions non échangées, absence partie adverse..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {resultType === 'RADIATION' && (
                <div className="space-y-2">
                  <Label>Motif de radiation *</Label>
                  <Textarea
                    placeholder="Ex: Défaut de diligences, désistement..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              {resultType === 'DELIBERE' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Résumé du délibéré *</Label>
                    <Textarea
                      placeholder="Ex: Condamnation à 5000€ de dommages-intérêts..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={6}
                    />
                  </div>

                  {/* Appeal Reminder Section */}
                  <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="createAppealReminder"
                        checked={createAppealReminder}
                        onCheckedChange={(checked) => setCreateAppealReminder(checked as boolean)}
                      />
                      <Label
                        htmlFor="createAppealReminder"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Créer un rappel de recours (recommandé)
                      </Label>
                    </div>

                    {createAppealReminder && (
                      <div className="space-y-4 pl-6">
                        <div className="space-y-2">
                          <Label>Date limite du recours</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !appealDeadline && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {appealDeadline
                                  ? format(appealDeadline, 'PPP', { locale: fr })
                                  : 'Sélectionner une date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={appealDeadline}
                                onSelect={setAppealDeadline}
                                initialFocus
                                locale={fr}
                              />
                            </PopoverContent>
                          </Popover>
                          <p className="text-xs text-muted-foreground">
                            Par défaut : 10 jours après le délibéré
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="appealNotes">Notes sur le recours (optionnel)</Label>
                          <Textarea
                            id="appealNotes"
                            placeholder="Ex: Vérifier les délais spécifiques, préparer les pièces..."
                            value={appealNotes}
                            onChange={(e) => setAppealNotes(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer le résultat'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
