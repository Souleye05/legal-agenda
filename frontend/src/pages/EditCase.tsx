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
import { api } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { JURISDICTION_OPTIONS, CHAMBER_OPTIONS } from '@/lib/constants';

const updateCaseSchema = z.object({
  titre: z.string().min(1, 'Le titre est obligatoire'),
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
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);

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

      setValue('titre', caseInfo.titre);
      setValue('juridiction', caseInfo.juridiction);
      setValue('chambre', caseInfo.chambre || '');
      setValue('ville', caseInfo.ville || '');
      setValue('observations', caseInfo.observations || '');
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
        titre: data.titre,
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
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
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
                <Label htmlFor="titre">Intitulé de l'affaire *</Label>
                <Input
                  id="titre"
                  placeholder="Ex: Dupont c/ Martin - Expulsion"
                  {...register('titre')}
                />
                {errors.titre && (
                  <p className="text-sm text-destructive">{errors.titre.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Juridiction *</Label>
                  <Select 
                    value={watch('juridiction')} 
                    onValueChange={(value) => setValue('juridiction', value, { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {JURISDICTION_OPTIONS.map(j => (
                        <SelectItem key={j} value={j}>{j}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.juridiction && (
                    <p className="text-sm text-destructive">{errors.juridiction.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Chambre</Label>
                  <Select 
                    value={watch('chambre')} 
                    onValueChange={(value) => setValue('chambre', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHAMBER_OPTIONS.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.chambre && (
                    <p className="text-sm text-destructive">{errors.chambre.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  placeholder="Ex: Paris, Lyon..."
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

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note :</strong> La modification des parties et du numéro de référence n'est pas disponible pour le moment. 
                  Contactez un administrateur si vous devez modifier ces informations.
                </p>
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
