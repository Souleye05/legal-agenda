import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Users, 
  Edit,
  Trash2,
  CheckCircle,
  FileEdit
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { HearingStatusBadge } from '@/components/hearings/HearingStatusBadge';
import { HEARING_TYPE_LABELS } from '@/lib/constants';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Party {
  id: string;
  nom: string;
  role: string;
  email?: string;
  telephone?: string;
}

interface Case {
  id: string;
  reference: string;
  titre: string;
  juridiction: string;
  chambre: string;
  statut: string;
  parties: Party[];
}

interface Result {
  id: string;
  type: string;
  nouvelleDate?: string;
  motifRenvoi?: string;
  motifRadiation?: string;
  texteDelibere?: string;
  createdAt: string;
}

interface Hearing {
  id: string;
  date: string;
  heure?: string;
  type: string;
  statut: string;
  notesPreparation?: string;
  estPreparee: boolean;
  affaire: Case;
  resultat?: Result;
  createdAt: string;
  updatedAt: string;
}

export default function HearingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hearing, setHearing] = useState<Hearing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHearing();
  }, [id]);

  const loadHearing = async () => {
    try {
      setLoading(true);
      const hearing: any = await api.get(`/hearings/${id}`);
      setHearing(hearing);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de charger l\'audience',
        variant: 'destructive',
      });
      navigate('/agenda');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette audience ?')) return;

    try {
      await api.delete(`/hearings/${id}`);
      toast({
        title: 'Succès',
        description: 'Audience supprimée avec succès',
      });
      navigate('/agenda');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de supprimer l\'audience',
        variant: 'destructive',
      });
    }
  };

  const handleMarkPrepared = async () => {
    try {
      await api.patch(`/hearings/${id}`, { estPreparee: true });
      toast({
        title: 'Succès',
        description: 'Audience marquée comme préparée',
      });
      loadHearing();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de marquer l\'audience',
        variant: 'destructive',
      });
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

  const isUrgent = hearing.statut === 'NON_RENSEIGNEE';
  const isUpcoming = hearing.statut === 'A_VENIR';
  const isCompleted = hearing.statut === 'TENUE';

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <PageHeader
                title="Détails de l'audience"
                description={`${HEARING_TYPE_LABELS[hearing.type]} - ${format(new Date(hearing.date), 'dd MMMM yyyy', { locale: fr })}`}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUpcoming && !hearing.estPreparee && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkPrepared}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marquer préparé
              </Button>
            )}
            {isUrgent && (
              <Button
                size="sm"
                className="bg-urgent hover:bg-urgent/90"
                onClick={() => navigate(`/audiences/${id}/renseigner`)}
              >
                <FileEdit className="h-4 w-4 mr-2" />
                Renseigner
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/audiences/${id}/modifier`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 m-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6 lg:pr-4">
            {/* Audience info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Informations de l'audience</CardTitle>
                  <HearingStatusBadge status={hearing.statut} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {format(new Date(hearing.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  {hearing.heure && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Heure</p>
                        <p className="font-medium">{hearing.heure}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type d'audience</p>
                  <Badge variant="outline" className="text-sm">
                    {HEARING_TYPE_LABELS[hearing.type]}
                  </Badge>
                </div>

                {hearing.estPreparee && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Audience préparée</span>
                    </div>
                  </>
                )}

                {hearing.notesPreparation && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Notes de préparation</p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{hearing.notesPreparation}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Case info */}
            <Card>
              <CardHeader>
                <CardTitle>Affaire liée</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Référence</p>
                  <p className="font-mono font-medium">{hearing.affaire.reference}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Titre</p>
                  <p className="font-medium">{hearing.affaire.titre}</p>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Juridiction</p>
                    <p className="font-medium">
                      {hearing.affaire.juridiction} • {hearing.affaire.chambre}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/affaires/${hearing.affaire.id}`)}
                  >
                    Voir l'affaire complète
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Result */}
            {hearing.resultat && (
              <Card>
                <CardHeader>
                  <CardTitle>Résultat de l'audience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Type de résultat</p>
                    <Badge className="text-sm">
                      {hearing.resultat.type}
                    </Badge>
                  </div>

                  {hearing.resultat.type === 'RENVOI' && hearing.resultat.nouvelleDate && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Nouvelle date</p>
                        <p className="font-medium">
                          {format(new Date(hearing.resultat.nouvelleDate), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                      {hearing.resultat.motifRenvoi && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Motif du renvoi</p>
                          <p className="text-sm">{hearing.resultat.motifRenvoi}</p>
                        </div>
                      )}
                    </>
                  )}

                  {hearing.resultat.type === 'RADIATION' && hearing.resultat.motifRadiation && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Motif de radiation</p>
                        <p className="text-sm">{hearing.resultat.motifRadiation}</p>
                      </div>
                    </>
                  )}

                  {hearing.resultat.type === 'DELIBERE' && hearing.resultat.texteDelibere && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Texte du délibéré</p>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{hearing.resultat.texteDelibere}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Renseigné le {format(new Date(hearing.resultat.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Parties */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <CardTitle>Parties</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Demandeurs */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Demandeur(s)</p>
                  <div className="space-y-2">
                    {hearing.affaire.parties
                      .filter(p => p.role === 'DEMANDEUR')
                      .map(party => (
                        <div key={party.id} className="bg-muted/50 p-2 rounded">
                          <p className="font-medium text-sm">{party.nom}</p>
                          {party.email && (
                            <p className="text-xs text-muted-foreground">{party.email}</p>
                          )}
                          {party.telephone && (
                            <p className="text-xs text-muted-foreground">{party.telephone}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                <Separator />

                {/* Défendeurs */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Défendeur(s)</p>
                  <div className="space-y-2">
                    {hearing.affaire.parties
                      .filter(p => p.role === 'DEFENDEUR')
                      .map(party => (
                        <div key={party.id} className="bg-muted/50 p-2 rounded">
                          <p className="font-medium text-sm">{party.nom}</p>
                          {party.email && (
                            <p className="text-xs text-muted-foreground">{party.email}</p>
                          )}
                          {party.telephone && (
                            <p className="text-xs text-muted-foreground">{party.telephone}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Conseil adverse */}
                {hearing.affaire.parties.some(p => p.role === 'CONSEIL_ADVERSE') && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Conseil adverse</p>
                      <div className="space-y-2">
                        {hearing.affaire.parties
                          .filter(p => p.role === 'CONSEIL_ADVERSE')
                          .map(party => (
                            <div key={party.id} className="bg-muted/50 p-2 rounded">
                              <p className="font-medium text-sm">{party.nom}</p>
                              {party.email && (
                                <p className="text-xs text-muted-foreground">{party.email}</p>
                              )}
                              {party.telephone && (
                                <p className="text-xs text-muted-foreground">{party.telephone}</p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Informations système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Créée le</p>
                  <p className="font-medium">
                    {format(new Date(hearing.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground">Modifiée le</p>
                  <p className="font-medium">
                    {format(new Date(hearing.updatedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
