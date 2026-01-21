import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { HearingCard } from '@/components/hearings/HearingCard';
import { api } from '@/lib/api';
import { CalendarCheck, FileDown, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Hearing as ApiHearing } from '@/types/api';
import { transformHearingWithCase } from '@/lib/transformers';

export default function TomorrowHearings() {
  const { data: apiHearings = [], isLoading } = useQuery<ApiHearing[]>({
    queryKey: ['tomorrow-hearings'],
    queryFn: () => api.getTomorrowHearings(),
  });

  // Transform API data
  const tomorrowHearings = apiHearings.map(transformHearingWithCase);

  const tomorrow = addDays(new Date(), 1);

  const [preparedIds, setPreparedIds] = useState<Set<string>>(
    new Set(tomorrowHearings.filter(h => h.isPrepared).map(h => h.id))
  );

  const handleMarkPrepared = (hearingId: string) => {
    setPreparedIds(prev => {
      const next = new Set(prev);
      next.add(hearingId);
      return next;
    });
    // TODO: Update in database
  };

  const allPrepared = tomorrowHearings.every((h: any) => preparedIds.has(h.id));

  const handlePrint = () => {
    toast.success('Utilisez Ctrl+P pour imprimer');
    window.print();
  };

  const handleExportPDF = () => {
    toast.success('Export PDF - Fonctionnalité à venir');
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
          title="Audiences de demain"
          description={format(tomorrow, "EEEE d MMMM yyyy", { locale: fr })}
        >
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
        </PageHeader>

        {tomorrowHearings.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucune audience demain</h3>
            <p className="text-muted-foreground">
              Profitez-en pour préparer vos dossiers à venir.
            </p>
          </div>
        ) : (
          <>
            {allPrepared ? (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-success/10 border border-success/20">
                <CalendarCheck className="h-5 w-5 text-success flex-shrink-0" />
                <p className="text-sm text-foreground">
                  <strong>Toutes les audiences sont préparées !</strong> Vous êtes prêt pour demain.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-accent/10 border border-accent/20">
                <CalendarCheck className="h-5 w-5 text-accent flex-shrink-0" />
                <p className="text-sm text-foreground">
                  <strong>{tomorrowHearings.length} audience{tomorrowHearings.length > 1 ? 's' : ''}</strong> prévue{tomorrowHearings.length > 1 ? 's' : ''} demain. 
                  {preparedIds.size < tomorrowHearings.length && (
                    <> {tomorrowHearings.length - preparedIds.size} restante{tomorrowHearings.length - preparedIds.size > 1 ? 's' : ''} à préparer.</>
                  )}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {tomorrowHearings.map((hearing) => (
                <HearingCard
                  key={hearing.id}
                  hearing={{ ...hearing, isPrepared: preparedIds.has(hearing.id) }}
                  caseData={hearing.affaire}
                  onMarkPrepared={() => handleMarkPrepared(hearing.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
