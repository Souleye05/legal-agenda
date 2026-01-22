import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { HEARING_TYPE_LABELS } from '@/lib/constants';
import { z } from 'zod';

const updateHearingSchema = z.object({
  date: z.date({ required_error: 'La date est obligatoire' }),
  heure: z.string().optional(),
  type: z.string().min(1, 'Le type est obligatoire'),
  notesPreparation: z.string().optional(),
  estPreparee: z.boolean().optional(),
});

type UpdateHearingFormData = z.infer<typeof updateHearingSchema>;

export default function EditHearing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateHearingFormData>({
    resolver: zodResolver(updateHearingSchema),
  });

  useEffect(() => {
    loadHearing();
  }, [id]);

  const loadHearing = async () => {
    try {
      setLoading(true);
      const hearing: any = await api.get(`/hearings/${id}`);

      setValue('date', new Date(hearing.date));
      setValue('heure', hearing.heure || '');
      setValue('type', hearing.type);
      setValue('notesPreparation', hearing.notesPreparation || '');
      setValue('estPreparee', hearing.estPreparee || false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'audience',
        variant: 'destructive',
      });
      navigate('/agenda');
    } finally {
      setLoading(false);
    }
  };

  const updateHearingMutation = useMutation({
    mutationFn: (data: UpdateHearingFormData) => api.patch(`/hearings/${id}`, {
      date: data.date.toISOString(),
      heure: data.heure || undefined,
      type: data.type,
      notesPreparation: data.notesPreparation || undefined,
      estPreparee: data.estPreparee,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hearings'] });
      toast({
        title: 'Succès',
        description: 'L\'audience a été modifiée avec succès',
      });
      navigate(`/audiences/${id}`);
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier l\'audience',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: UpdateHearingFormData) => {
    updateHearingMutation.mutate(data);
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

  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <PageHeader 
            title="Modifier l'audience"
            description="Mettre à jour les informations de l'audience"
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Informations de l'audience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Date de l'audience *</Label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP', { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="heure">Heure (optionnel)</Label>
                <Input
                  id="heure"
                  type="time"
                  {...register('heure')}
                />
                {errors.heure && (
                  <p className="text-sm text-destructive">{errors.heure.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Type d'audience *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(HEARING_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notesPreparation">Notes de préparation</Label>
                <Textarea
                  id="notesPreparation"
                  placeholder="Points à préparer, documents à apporter..."
                  {...register('notesPreparation')}
                  rows={4}
                />
                {errors.notesPreparation && (
                  <p className="text-sm text-destructive">{errors.notesPreparation.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="estPreparee"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="estPreparee"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor="estPreparee"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Audience préparée
                </Label>
              </div>

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
                  disabled={isSubmitting || updateHearingMutation.isPending}
                >
                  {isSubmitting || updateHearingMutation.isPending ? 'Modification...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
