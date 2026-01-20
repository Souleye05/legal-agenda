import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { api } from '@/lib/api';
import { HearingType } from '@/types/legal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { HEARING_TYPE_LABELS } from '@/lib/constants';

export default function NewHearing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const preselectedCaseId = searchParams.get('affaireId');
  const preselectedDate = searchParams.get('date');

  const [formData, setFormData] = useState({
    affaireId: preselectedCaseId || '',
    date: preselectedDate ? new Date(preselectedDate) : undefined as Date | undefined,
    heure: '',
    type: '' as HearingType | '',
    notesPreparation: '',
  });

  // Fetch active cases
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => api.getCases(),
  });

  const activeCases = cases.filter((c: any) => c.statut === 'ACTIVE');

  const createHearingMutation = useMutation({
    mutationFn: (data: any) => api.createHearing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hearings'] });
      toast({
        title: "Audience créée",
        description: "L'audience a été créée avec succès",
      });
      navigate('/agenda');
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'audience",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.affaireId || !formData.date || !formData.type) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    createHearingMutation.mutate({
      affaireId: formData.affaireId,
      date: formData.date.toISOString(),
      heure: formData.heure || undefined,
      type: formData.type,
      notesPreparation: formData.notesPreparation || undefined,
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
          <div className="card-elevated p-8 text-center text-muted-foreground">
            Chargement...
          </div>
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
            title="Nouvelle audience"
            description="Planifier une nouvelle audience"
          />
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Informations de l'audience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Affaire */}
              <div className="space-y-2">
                <Label htmlFor="affaireId">Affaire liée *</Label>
                <Select 
                  value={formData.affaireId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, affaireId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une affaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCases.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{c.titre}</span>
                          <span className="text-xs text-muted-foreground">{c.reference}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Date de l'audience *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, 'PPP', { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Heure */}
              <div className="space-y-2">
                <Label htmlFor="heure">Heure (optionnel)</Label>
                <Input
                  id="heure"
                  type="time"
                  value={formData.heure}
                  onChange={(e) => setFormData(prev => ({ ...prev, heure: e.target.value }))}
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>Type d'audience *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: HearingType) => setFormData(prev => ({ ...prev, type: value }))}
                >
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
              </div>

              {/* Notes de préparation */}
              <div className="space-y-2">
                <Label htmlFor="notesPreparation">Notes de préparation</Label>
                <Textarea
                  id="notesPreparation"
                  placeholder="Points à préparer, documents à apporter..."
                  value={formData.notesPreparation}
                  onChange={(e) => setFormData(prev => ({ ...prev, notesPreparation: e.target.value }))}
                  rows={4}
                />
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
                  disabled={createHearingMutation.isPending}
                >
                  {createHearingMutation.isPending ? 'Création...' : 'Créer l\'audience'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
}
