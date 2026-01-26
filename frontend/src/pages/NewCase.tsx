import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCaseSchema, type CreateCaseFormData } from '@/lib/validations';
import { JURISDICTION_OPTIONS, CHAMBER_OPTIONS } from '@/lib/constants';

export default function NewCase() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCustomJurisdiction, setShowCustomJurisdiction] = useState(false);
  const [showCustomChamber, setShowCustomChamber] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateCaseFormData>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      reference: '',
      titre: '',
      juridiction: '',
      chambre: '',
      ville: '',
      observations: '',
      parties: [
        { nom: '', role: 'demandeur' },
        { nom: '', role: 'defendeur' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parties',
  });

  const createCaseMutation = useMutation({
    mutationFn: (data: CreateCaseFormData) => {
      // Transform form data to API format - filter out empty parties
      const validParties = data.parties.filter(p => p.nom.trim());
      const apiData = {
        reference: data.reference,
        titre: data.titre,
        juridiction: data.juridiction,
        chambre: data.chambre || undefined,
        ville: data.ville || undefined,
        observations: data.observations || undefined,
        parties: validParties.map(p => ({
          nom: p.nom,
          role: p.role.toUpperCase() as 'DEMANDEUR' | 'DEFENDEUR' | 'CONSEIL_ADVERSE'
        })),
      };
      return api.createCase(apiData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({
        title: "Affaire créée",
        description: "L'affaire a été créée avec succès",
      });
      navigate(`/affaires/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'affaire",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCaseFormData) => {
    createCaseMutation.mutate(data);
  };

  const demandeurs = fields.filter((_, index) => watch(`parties.${index}.role`) === 'demandeur');
  const defendeurs = fields.filter((_, index) => watch(`parties.${index}.role`) === 'defendeur');
  const conseils = fields.filter((_, index) => watch(`parties.${index}.role`) === 'conseil_adverse');

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/affaires')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PageHeader 
            title="Nouvelle affaire"
            description="Créer un nouveau dossier"
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Informations générales</h3>
            
            <div className="space-y-2">
              <Label htmlFor="reference">Numéro de référence *</Label>
              <Input
                id="reference"
                placeholder="Ex: 2024/001 ou RG-2024-0001"
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
                placeholder="Ex: Dakar"
                {...register('ville')}
              />
              {errors.ville && (
                <p className="text-sm text-destructive">{errors.ville.message}</p>
              )}
            </div>
          </div>

          {/* Parties */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Parties</h3>

            {/* Demandeurs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Demandeur(s) *</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => append({ nom: '', role: 'demandeur' })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              {fields.map((field, index) => {
                if (watch(`parties.${index}.role`) !== 'demandeur') return null;
                return (
                  <div key={field.id} className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Nom du demandeur"
                        {...register(`parties.${index}.nom`)}
                      />
                      {errors.parties?.[index]?.nom && (
                        <p className="text-xs text-destructive">
                          {errors.parties[index]?.nom?.message}
                        </p>
                      )}
                    </div>
                    {demandeurs.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Défendeurs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Défendeur(s) *</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => append({ nom: '', role: 'defendeur' })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              {fields.map((field, index) => {
                if (watch(`parties.${index}.role`) !== 'defendeur') return null;
                return (
                  <div key={field.id} className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Nom du défendeur"
                        {...register(`parties.${index}.nom`)}
                      />
                      {errors.parties?.[index]?.nom && (
                        <p className="text-xs text-destructive">
                          {errors.parties[index]?.nom?.message}
                        </p>
                      )}
                    </div>
                    {defendeurs.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Conseils adverses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Conseil adverse (optionnel)</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => append({ nom: '', role: 'conseil_adverse' })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              {fields.map((field, index) => {
                if (watch(`parties.${index}.role`) !== 'conseil_adverse') return null;
                return (
                  <div key={field.id} className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Nom du conseil adverse"
                        {...register(`parties.${index}.nom`)}
                      />
                      {errors.parties?.[index]?.nom && (
                        <p className="text-xs text-destructive">
                          {errors.parties[index]?.nom?.message}
                        </p>
                      )}
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {errors.parties && typeof errors.parties.message === 'string' && (
              <p className="text-sm text-destructive">{errors.parties.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Notes</h3>
            <div className="space-y-2">
              <Label htmlFor="observations">Observations générales</Label>
              <Textarea
                id="observations"
                placeholder="Notes sur l'affaire..."
                {...register('observations')}
                rows={4}
              />
              {errors.observations && (
                <p className="text-sm text-destructive">{errors.observations.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={() => navigate('/affaires')}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isSubmitting || createCaseMutation.isPending}
            >
              {isSubmitting || createCaseMutation.isPending ? 'Création...' : 'Créer l\'affaire'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
