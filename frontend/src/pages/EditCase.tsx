import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { JURISDICTION_OPTIONS, CHAMBER_OPTIONS } from '@/lib/constants';

const partySchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  role: z.enum(['DEMANDEUR', 'DEFENDEUR', 'CONSEIL_ADVERSE']),
});

const updateCaseSchema = z.object({
  reference: z.string().min(1, 'La référence est obligatoire'),
  titre: z.string().min(1, 'Le titre est obligatoire'),
  parties: z.array(partySchema).default([]),
  juridiction: z.string().min(1, 'La juridiction est obligatoire'),
  chambre: z.string().optional(),
  ville: z.string().optional(),
  observations: z.string().optional(),
});

type UpdateCaseFormData = z.infer<typeof updateCaseSchema>;

export default function EditCase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [showCustomJurisdiction, setShowCustomJurisdiction] = useState(false);
  const [showCustomChamber, setShowCustomChamber] = useState(false);
  const [parties, setParties] = useState<Array<{ nom: string; role: 'DEMANDEUR' | 'DEFENDEUR' | 'CONSEIL_ADVERSE' }>>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCaseFormData>({
    resolver: zodResolver(updateCaseSchema),
  });

  useEffect(() => {
    loadCase();
  }, [id]);

  const loadCase = async () => {
    try {
      setLoading(true);
      const caseInfo: any = await api.get(`/cases/${id}`);
      setCaseData(caseInfo);

      setValue('reference', caseInfo.reference);
      setValue('titre', caseInfo.titre);
      setValue('juridiction', caseInfo.juridiction);
      setValue('chambre', caseInfo.chambre || '');
      setValue('ville', caseInfo.ville || '');
      setValue('observations', caseInfo.observations || '');
      
      // Load parties
      setParties(caseInfo.parties || []);

      // Check if loaded values are in predefined options, if not show custom input
      if (caseInfo.juridiction && !JURISDICTION_OPTIONS.includes(caseInfo.juridiction)) {
        setShowCustomJurisdiction(true);
      }
      if (caseInfo.chambre && !CHAMBER_OPTIONS.includes(caseInfo.chambre)) {
        setShowCustomChamber(true);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de charger l\'affaire',
        variant: 'destructive',
      });
      navigate('/affaires');
    } finally {
      setLoading(false);
    }
  };

  const updateCaseMutation = useMutation({
    mutationFn: (data: UpdateCaseFormData) => {
      return api.patch(`/cases/${id}`, {
        reference: data.reference,
        titre: data.titre,
        parties: parties,
        juridiction: data.juridiction,
        chambre: data.chambre || undefined,
        ville: data.ville || undefined,
        observations: data.observations || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', id] });
      toast({
        title: 'Succès',
        description: 'L\'affaire a été modifiée avec succès',
      });
      navigate(`/affaires/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de modifier l\'affaire',
        variant: 'destructive',
      });
    },
  });

  const deleteCaseMutation = useMutation({
    mutationFn: () => api.delete(`/cases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({
        title: 'Succès',
        description: 'L\'affaire a été supprimée avec succès',
      });
      navigate('/affaires');
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de supprimer l\'affaire',
        variant: 'destructive',
      });
    },
  });

  const addParty = (role: 'DEMANDEUR' | 'DEFENDEUR') => {
    setParties([...parties, { nom: '', role }]);
  };

  const removeParty = (index: number) => {
    setParties(parties.filter((_, i) => i !== index));
  };

  const updateParty = (index: number, field: 'nom' | 'role', value: string) => {
    const updated = [...parties];
    updated[index] = { ...updated[index], [field]: value };
    setParties(updated);
  };

  const onSubmit = (data: UpdateCaseFormData) => {
    updateCaseMutation.mutate(data);
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

  if (!caseData) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PageHeader
            title="Modifier l'affaire"
            description={`Référence: ${caseData.reference}`}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reference">Numéro de référence *</Label>
                <Input
                  id="reference"
                  placeholder="Ex: RG-2024-001"
                  {...register('reference')}
                />
                {errors.reference && (
                  <p className="text-sm text-destructive">{errors.reference.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="titre">Intitulé de l'affaire *</Label>
                <Input
                  id="titre"
                  placeholder="Moustapha NDIAYE c/ SGBS"
                  {...register('titre')}
                />
                {errors.titre && (
                  <p className="text-sm text-destructive">{errors.titre.message}</p>
                )}
              </div>

              {/* Parties Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Parties (optionnel)</Label>
                </div>

                {/* Demandeurs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Demandeur(s)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addParty('DEMANDEUR')}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  {parties.filter(p => p.role === 'DEMANDEUR').length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Aucun demandeur ajouté</p>
                  ) : (
                    <div className="space-y-2">
                      {parties.map((party, index) => 
                        party.role === 'DEMANDEUR' && (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Nom du demandeur"
                              value={party.nom}
                              onChange={(e) => updateParty(index, 'nom', e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeParty(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Défendeurs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Défendeur(s)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addParty('DEFENDEUR')}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  {parties.filter(p => p.role === 'DEFENDEUR').length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Aucun défendeur ajouté</p>
                  ) : (
                    <div className="space-y-2">
                      {parties.map((party, index) => 
                        party.role === 'DEFENDEUR' && (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Nom du défendeur"
                              value={party.nom}
                              onChange={(e) => updateParty(index, 'nom', e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeParty(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Juridiction *</Label>
                  {!showCustomJurisdiction ? (
                    <>
                      <Select
                        value={watch('juridiction')}
                        onValueChange={(value) => {
                          if (value === '__custom__') {
                            setShowCustomJurisdiction(true);
                            setValue('juridiction', '', { shouldValidate: true });
                          } else {
                            setValue('juridiction', value, { shouldValidate: true });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {JURISDICTION_OPTIONS.map(j => (
                            <SelectItem key={j} value={j}>{j}</SelectItem>
                          ))}
                          <SelectItem value="__custom__" className="text-primary font-medium">
                            + Autre (saisir manuellement)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Saisir la juridiction"
                        {...register('juridiction')}
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCustomJurisdiction(false);
                          setValue('juridiction', '', { shouldValidate: true });
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  )}
                  {errors.juridiction && (
                    <p className="text-sm text-destructive">{errors.juridiction.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Chambre</Label>
                  {!showCustomChamber ? (
                    <>
                      <Select
                        value={watch('chambre') || ''}
                        onValueChange={(value) => {
                          if (value === '__custom__') {
                            setShowCustomChamber(true);
                            setValue('chambre', '');
                          } else {
                            setValue('chambre', value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {CHAMBER_OPTIONS.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                          <SelectItem value="__custom__" className="text-primary font-medium">
                            + Autre (saisir manuellement)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Saisir la chambre"
                        {...register('chambre')}
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCustomChamber(false);
                          setValue('chambre', '');
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  )}
                  {errors.chambre && (
                    <p className="text-sm text-destructive">{errors.chambre.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  placeholder="Ex: Dakar, Lyon..."
                  {...register('ville')}
                />
                {errors.ville && (
                  <p className="text-sm text-destructive">{errors.ville.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observations</Label>
                <Textarea
                  id="observations"
                  placeholder="Notes, remarques particulières..."
                  {...register('observations')}
                  rows={4}
                />
                {errors.observations && (
                  <p className="text-sm text-destructive">{errors.observations.message}</p>
                )}
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
                {user?.role === 'ADMIN' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={deleteCaseMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer cette affaire ? Cette action est irréversible et supprimera également toutes les audiences associées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteCaseMutation.mutate()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || updateCaseMutation.isPending}
                >
                  {isSubmitting || updateCaseMutation.isPending ? 'Modification...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
