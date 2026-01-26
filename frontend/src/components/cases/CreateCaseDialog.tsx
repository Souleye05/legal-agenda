import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCaseSchema, type CreateCaseFormData } from '@/lib/validations';
import { JURISDICTION_OPTIONS, CHAMBER_OPTIONS } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreateCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCaseCreated?: (caseId: string) => void;
}

export function CreateCaseDialog({ open, onOpenChange, onCaseCreated }: CreateCaseDialogProps) {
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
    reset,
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
      reset();
      setShowCustomJurisdiction(false);
      setShowCustomChamber(false);
      onOpenChange(false);
      if (onCaseCreated) {
        onCaseCreated(data.id);
      }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle affaire</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour créer une nouvelle affaire
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Informations générales</h3>
              
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
              </div>
            </div>

            {/* Parties */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Parties</h3>

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
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observations générales</Label>
              <Textarea
                id="observations"
                placeholder="Notes sur l'affaire..."
                {...register('observations')}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || createCaseMutation.isPending}
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
