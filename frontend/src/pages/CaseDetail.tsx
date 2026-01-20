import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CaseStatusBadge } from '@/components/cases/CaseStatusBadge';
import { HearingStatusBadge } from '@/components/hearings/HearingStatusBadge';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Calendar, Users, FileText, Clock, Plus } from 'lucide-react';
import { HEARING_TYPE_LABELS } from '@/lib/constants';

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: () => api.getCase(id!),
    enabled: !!id,
  });

  const { data: hearings = [], isLoading: hearingsLoading } = useQuery({
    queryKey: ['hearings', id],
    queryFn: () => api.getHearings({ caseId: id }),
    enabled: !!id,
  });

  if (caseLoading || hearingsLoading) {
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

  if (!caseData) {
    return (
      <MainLayout>
        <div className="p-6 md:p-8 max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-4">Affaire non trouvée</h2>
          <Button onClick={() => navigate('/affaires')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux affaires
          </Button>
        </div>
      </MainLayout>
    );
  }

  const demandeurs = caseData.parties?.filter((p: any) => p.role === 'demandeur') || [];
  const defendeurs = caseData.parties?.filter((p: any) => p.role === 'defendeur') || [];
  const avocats = caseData.parties?.filter((p: any) => p.role === 'conseil_adverse') || [];

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/affaires')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {caseData.reference}
              </span>
              <CaseStatusBadge status={caseData.statut} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              {caseData.titre}
            </h1>
          </div>
        </div>

        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Juridiction</p>
              <p className="font-medium">{caseData.juridiction}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chambre</p>
              <p className="font-medium">{caseData.chambre || 'Non précisée'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ville</p>
              <p className="font-medium">{caseData.ville || 'Non précisée'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date de création</p>
              <p className="font-medium">
                {format(new Date(caseData.createdAt), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Parties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <Users className="h-5 w-5" />
              Parties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {demandeurs.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Demandeur(s)</p>
                <div className="space-y-1">
                  {demandeurs.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        Demandeur
                      </Badge>
                      <span className="font-medium">{p.nom}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {defendeurs.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Défendeur(s)</p>
                <div className="space-y-1">
                  {defendeurs.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        Défendeur
                      </Badge>
                      <span className="font-medium">{p.nom}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {avocats.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Avocat(s) adverse(s)</p>
                <div className="space-y-1">
                  {avocats.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <Badge variant="outline">Avocat</Badge>
                      <span className="font-medium">{p.nom}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observations */}
        {caseData.observations && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif">Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{caseData.observations}</p>
            </CardContent>
          </Card>
        )}

        {/* Audiences */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Audiences ({hearings.length})
            </CardTitle>
            <Button size="sm" onClick={() => navigate(`/agenda/nouvelle-audience?affaireId=${id}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle audience
            </Button>
          </CardHeader>
          <CardContent>
            {hearings.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucune audience enregistrée pour cette affaire
              </p>
            ) : (
              <div className="space-y-3">
                {hearings
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((hearing: any) => (
                    <div 
                      key={hearing.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">
                              {HEARING_TYPE_LABELS[hearing.type] || hearing.type}
                            </Badge>
                            <HearingStatusBadge status={hearing.statut} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(hearing.date), 'dd MMM yyyy', { locale: fr })}
                            </span>
                            {hearing.heure && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {hearing.heure}
                              </span>
                            )}
                          </div>
                        </div>
                        {hearing.statut === 'NON_RENSEIGNEE' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-urgent border-urgent hover:bg-urgent/10"
                            onClick={() => navigate(`/a-renseigner?hearing=${hearing.id}`)}
                          >
                            Renseigner
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
