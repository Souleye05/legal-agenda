import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { HearingCard } from '@/components/hearings/HearingCard';
import { api } from '@/lib/api';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, RotateCcw, XCircle, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HearingResultType, Hearing, Case } from '@/types/legal';
import { useToast } from '@/hooks/use-toast';
import type { Hearing as ApiHearing } from '@/types/api';
import { transformHearingWithCase } from '@/lib/transformers';

export default function UnreportedHearings() {
  const { toast } = useToast();
  const { data: apiHearings = [], isLoading, refetch } = useQuery<ApiHearing[]>({
    queryKey: ['unreported-hearings'],
    queryFn: () => api.getUnreportedHearings(),
  });

  // Transform API data
  const unreportedHearings = apiHearings.map(transformHearingWithCase);

  const [selectedHearing, setSelectedHearing] = useState<(Hearing & { affaire: Case }) | null>(null);
  const [resultType, setResultType] = useState<HearingResultType>('RENVOI');
  const [newDate, setNewDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRecordResult = (hearing: Hearing & { affaire: Case }) => {
    setSelectedHearing(hearing);
    setResultType('RENVOI');
    setNewDate(undefined);
    setReason('');
  };

  const handleSubmit = async () => {
    if (!selectedHearing) return;

    setIsSubmitting(true);
    try {
      const data: any = { type: resultType };
      
      if (resultType === 'RENVOI') {
        data.nouvelleDate = newDate?.toISOString();
        data.motifRenvoi = reason;
      } else if (resultType === 'RADIATION') {
        data.motifRadiation = reason;
      } else if (resultType === 'DELIBERE') {
        data.texteDelibere = reason;
      }

      await api.recordHearingResult(selectedHearing.id, data);
      
      toast({
        title: "Résultat enregistré",
        description: "L'audience a été mise à jour avec succès",
      });
      
      setSelectedHearing(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer le résultat",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          <div className="card-elevated p-8 text-center text-muted-foreground">
            Chargement...
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
        <PageHeader 
          title="Audiences à renseigner"
          description="Ces audiences sont passées et nécessitent un résultat"
        />

        {unreportedHearings.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Scale className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Tout est à jour !</h3>
            <p className="text-muted-foreground">
              Toutes vos audiences passées ont été renseignées.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 p-4 rounded-lg bg-urgent/10 border border-urgent/20">
              <AlertTriangle className="h-5 w-5 text-urgent flex-shrink-0" />
              <p className="text-sm text-foreground">
                <strong>{unreportedHearings.length} audience{unreportedHearings.length > 1 ? 's' : ''}</strong> en attente de résultat. 
                Renseignez-les pour arrêter les alertes quotidiennes.
              </p>
            </div>

            <div className="space-y-4">
              {unreportedHearings.map((hearing) => (
                <HearingCard
                  key={hearing.id}
                  hearing={hearing}
                  caseData={hearing.affaire}
                  onRecordResult={() => handleRecordResult(hearing)}
                />
              ))}
            </div>
          </>
        )}

        {/* Result Dialog */}
        <Dialog open={!!selectedHearing} onOpenChange={() => setSelectedHearing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">Renseigner le résultat</DialogTitle>
            </DialogHeader>
            
            {selectedHearing && (
              <div className="space-y-6">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{selectedHearing.affaire?.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedHearing.affaire?.reference} • {format(selectedHearing.date, 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Type de résultat</Label>
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
                    />
                  </div>
                )}

                {resultType === 'DELIBERE' && (
                  <div className="space-y-2">
                    <Label>Résumé du délibéré *</Label>
                    <Textarea
                      placeholder="Ex: Condamnation à 5000€ de dommages-intérêts..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedHearing(null)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      (resultType === 'RENVOI' && (!newDate || !reason)) ||
                      ((resultType === 'RADIATION' || resultType === 'DELIBERE') && !reason)
                    }
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
