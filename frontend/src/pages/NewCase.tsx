import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const jurisdictionOptions = [
  'Tribunal Judiciaire',
  'Tribunal de Commerce',
  'Conseil de Prud\'hommes',
  'Cour d\'Appel',
  'Cour de Cassation',
  'Tribunal Administratif',
  'Cour Administrative d\'Appel',
];

const chamberOptions = [
  'Chambre civile',
  'Chambre commerciale',
  'Chambre sociale',
  'Chambre des référés',
  'Chambre correctionnelle',
  'Chambre de l\'instruction',
  'Chambre civile 1',
  'Chambre civile 2',
  'Chambre civile 3',
];

interface Party {
  nom: string;
  role: 'demandeur' | 'defendeur' | 'conseil_adverse';
}

export default function NewCase() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [chamber, setChamber] = useState('');
  const [city, setCity] = useState('');
  const [observations, setObservations] = useState('');
  const [parties, setParties] = useState<(Party & { id: string })[]>([
    { id: '1', nom: '', role: 'demandeur' },
    { id: '2', nom: '', role: 'defendeur' },
  ]);

  const createCaseMutation = useMutation({
    mutationFn: (data: any) => api.createCase(data),
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

  const addParty = (role: Party['role']) => {
    setParties([...parties, { id: Date.now().toString(), nom: '', role }]);
  };

  const removeParty = (id: string) => {
    setParties(parties.filter(p => p.id !== id));
  };

  const updateParty = (id: string, nom: string) => {
    setParties(parties.map(p => p.id === id ? { ...p, nom } : p));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validParties = parties.filter(p => p.nom.trim());
    
    if (!title || !jurisdiction || validParties.length < 2) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    createCaseMutation.mutate({
      titre: title,
      juridiction: jurisdiction,
      chambre: chamber || undefined,
      ville: city || undefined,
      observations: observations || undefined,
      parties: validParties.map(({ id, ...p }) => p),
    });
  };

  const demandeurs = parties.filter(p => p.role === 'demandeur');
  const defendeurs = parties.filter(p => p.role === 'defendeur');
  const conseils = parties.filter(p => p.role === 'conseil_adverse');

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Informations générales</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Intitulé de l'affaire *</Label>
              <Input
                id="title"
                placeholder="Ex: Dupont c/ Martin - Expulsion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Juridiction *</Label>
                <Select value={jurisdiction} onValueChange={setJurisdiction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {jurisdictionOptions.map(j => (
                      <SelectItem key={j} value={j}>{j}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chambre</Label>
                <Select value={chamber} onValueChange={setChamber}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {chamberOptions.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                placeholder="Ex: Paris"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          {/* Parties */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Parties</h3>

            {/* Demandeurs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Demandeur(s) *</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => addParty('demandeur')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              {demandeurs.map((party) => (
                <div key={party.id} className="flex gap-2">
                  <Input
                    placeholder="Nom du demandeur"
                    value={party.nom}
                    onChange={(e) => updateParty(party.id, e.target.value)}
                  />
                  {demandeurs.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeParty(party.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Défendeurs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Défendeur(s) *</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => addParty('defendeur')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              {defendeurs.map((party) => (
                <div key={party.id} className="flex gap-2">
                  <Input
                    placeholder="Nom du défendeur"
                    value={party.nom}
                    onChange={(e) => updateParty(party.id, e.target.value)}
                  />
                  {defendeurs.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeParty(party.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Conseils adverses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Conseil adverse (optionnel)</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => addParty('conseil_adverse')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              {conseils.map((party) => (
                <div key={party.id} className="flex gap-2">
                  <Input
                    placeholder="Nom du conseil adverse"
                    value={party.nom}
                    onChange={(e) => updateParty(party.id, e.target.value)}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeParty(party.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card-elevated p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Notes</h3>
            <div className="space-y-2">
              <Label htmlFor="observations">Observations générales</Label>
              <Textarea
                id="observations"
                placeholder="Notes sur l'affaire..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/affaires')}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={createCaseMutation.isPending}>
              {createCaseMutation.isPending ? 'Création...' : 'Créer l\'affaire'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
