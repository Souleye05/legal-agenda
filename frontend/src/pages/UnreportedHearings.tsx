import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { HearingCard } from '@/components/hearings/HearingCard';
import { api } from '@/lib/api';
import { AlertTriangle, Gavel, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, RotateCcw, XCircle, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HearingResultType, Hearing, Case } from '@/types/legal';
import { useToast } from '@/hooks/use-toast';
import type { Hearing as ApiHearing } from '@/types/api';
import { transformHearingWithCase } from '@/lib/transformers';
import { generateUnreportedHearingsPDF } from '@/lib/pdf-generator';
import { toast as sonnerToast } from 'sonner';

const ITEMS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);
  
  // Appeal reminder states
  const [hasAppealReminder, setHasAppealReminder] = useState(true);
  const [appealDeadlineDays, setAppealDeadlineDays] = useState(10);
  
  // Calculate appeal deadline date
  const appealDeadlineDate = hasAppealReminder && resultType === 'DELIBERE'
    ? new Date(Date.now() + appealDeadlineDays * 24 * 60 * 60 * 1000)
    : undefined;

  const handleRecordResult = (hearing: Hearing & { affaire: Case }) => {
    setSelectedHearing(hearing);
    setResultType('RENVOI');
    setNewDate(undefined);
    setReason('');
    setHasAppealReminder(true);
    setAppealDeadlineDays(10);
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
        
        // Add appeal reminder if enabled
        if (hasAppealReminder && appealDeadlineDate) {
          data.creerRappelRecours = true;
          data.dateLimiteRecours = appealDeadlineDate.toISOString();
        }
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

  const handleGeneratePDF = () => {
    try {
      // Transform hearings to include case data
      const hearingsWithCases = apiHearings.map(h => ({
        ...h,
        affaire: h.affaire!
      })).filter(h => h.affaire);
      
      generateUnreportedHearingsPDF(hearingsWithCases as any);
      sonnerToast.success('PDF téléchargé avec succès');
    } catch (error) {
      sonnerToast.error('Erreur lors de la génération du PDF');
      console.error(error);
    }
  };

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

  const totalPages = Math.ceil(unreportedHearings.length / ITEMS_PER_PAGE);
  const paginatedHearings = unreportedHearings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground font-serif">Audiences à renseigner</h1>
            <p className="mt-1 text-muted-foreground">Ces audiences sont passées et nécessitent un résultat</p>
          </div>
          {unreportedHearings.length > 0 && (
            <Button onClick={handleGeneratePDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          )}
        </div>

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
              {paginatedHearings.map((hearing) => (
                <HearingCard
                  key={hearing.id}
                  hearing={hearing}
                  caseData={hearing.affaire}
                  onRecordResult={() => handleRecordResult(hearing)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Résumé du délibéré *</Label>
                      <Textarea
                        placeholder="Ex: Condamnation à 5000€ de dommages-intérêts..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                      />
                    </div>

                    {/* Rappel recours */}
                    <div className="space-y-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="appealReminder"
                          checked={hasAppealReminder}
                          onCheckedChange={(checked) => setHasAppealReminder(checked as boolean)}
                        />
                        <div className="flex items-center gap-2">
                          <Gavel className="h-4 w-4 text-warning" />
                          <Label htmlFor="appealReminder" className="text-sm font-medium cursor-pointer">
                            Activer le rappel de recours
                          </Label>
                        </div>
                      </div>

                      {hasAppealReminder && (
                        <div className="ml-6 space-y-3">
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                              Délai de recours (jours)
                            </Label>
                            <Input
                              type="number"
                              min={1}
                              max={365}
                              value={appealDeadlineDays}
                              onChange={(e) => setAppealDeadlineDays(parseInt(e.target.value) || 10)}
                              className="w-24"
                            />
                          </div>

                          {appealDeadlineDate && (
                            <div className="p-3 rounded-lg bg-card border border-border/50">
                              <p className="text-sm text-muted-foreground">
                                Date limite de recours:{' '}
                                <span className="font-semibold text-foreground">
                                  {format(appealDeadlineDate, 'EEEE d MMMM yyyy', { locale: fr })}
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Rappel quotidien jusqu'au recours effectué
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
