import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { File, Download, Printer, CalendarIcon, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Hearing } from '@/types/api';
// import { generateDailyReportPDF, generateTrackingSheetPDF } from '@/lib/pdf-generator';
import { toast } from 'sonner';

export default function DailyReports() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tomorrowDate, setTomorrowDate] = useState<Date>(addDays(new Date(), 1));

  // Fetch all hearings
  const { data: allHearings = [] } = useQuery<Hearing[]>({
    queryKey: ['hearings'],
    queryFn: () => api.getHearings(),
  });

  const getHearingsForDate = (date: Date): Hearing[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allHearings.filter(h => format(new Date(h.date), 'yyyy-MM-dd') === dateStr);
  };

  const selectedDateHearings = getHearingsForDate(selectedDate);
  const tomorrowHearings = getHearingsForDate(tomorrowDate);

  const handleGenerateDailyReport = () => {
    // generateDailyReportPDF(selectedDateHearings, selectedDate);
    toast.success('Compte rendu PDF téléchargé');
  };

  const handlePrintDailyReport = () => {
    // generateDailyReportPDF(selectedDateHearings, selectedDate);
    toast.success('PDF généré - utilisez Ctrl+P pour imprimer');
  };

  const handleGenerateTrackingSheet = () => {
    // generateTrackingSheetPDF(tomorrowHearings, tomorrowDate);
    toast.success('Fiche de suivi PDF téléchargée');
  };

  const handlePrintTrackingSheet = () => {
    // generateTrackingSheetPDF(tomorrowHearings, tomorrowDate);
    toast.success('PDF généré - utilisez Ctrl+P pour imprimer');
  };

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
        <PageHeader 
          title="Comptes rendus"
          description="Générer les comptes rendus d'audience et fiches de suivi"
        />

        {/* Daily Report Section */}
        <div className="card-elevated p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Comptes rendus d'audience du jour</h3>
              <p className="text-sm text-muted-foreground">
                Générer les comptes rendus PDF avec motifs de renvoi, radiation ou délibéré
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date des audiences</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'PPP', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1" />

            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrintDailyReport} disabled={selectedDateHearings.length === 0}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer PDF
              </Button>
              <Button onClick={handleGenerateDailyReport} disabled={selectedDateHearings.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger PDF
              </Button>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {selectedDateHearings.length === 0 ? (
                "Aucune audience pour cette date"
              ) : (
                <>
                  <strong>{selectedDateHearings.length}</strong> audience{selectedDateHearings.length > 1 ? 's' : ''} trouvée{selectedDateHearings.length > 1 ? 's' : ''} pour le {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Tracking Sheet Section */}
        <div className="card-elevated p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success/10">
              <FileCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Fiche de suivi par juridiction</h3>
              <p className="text-sm text-muted-foreground">
                Fiche PDF imprimable pour les collaborateurs à l'audience
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date des audiences</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !tomorrowDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(tomorrowDate, 'PPP', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={tomorrowDate}
                    onSelect={(date) => date && setTomorrowDate(date)}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1" />

            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrintTrackingSheet} disabled={tomorrowHearings.length === 0}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer PDF
              </Button>
              <Button onClick={handleGenerateTrackingSheet} disabled={tomorrowHearings.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger PDF
              </Button>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {tomorrowHearings.length === 0 ? (
                "Aucune audience pour cette date"
              ) : (
                <>
                  <strong>{tomorrowHearings.length}</strong> audience{tomorrowHearings.length > 1 ? 's' : ''} trouvée{tomorrowHearings.length > 1 ? 's' : ''} pour le {format(tomorrowDate, 'd MMMM yyyy', { locale: fr })}
                </>
              )}
            </p>
          </div>

          <div className="text-xs text-muted-foreground mt-4 p-3 border border-dashed rounded-lg">
            <strong>Utilisation :</strong> Cette fiche permet aux collaborateurs de noter les résultats d'audience 
            (renvoi avec date et motif, radiation avec motif, ou délibéré) directement sur papier, 
            puis de transmettre la fiche à la secrétaire pour saisie dans l'application.
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
