import { ArrowRight, Calendar, Clock, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Nouvelle affaire',
      description: 'Créer un nouveau dossier',
      icon: Plus,
      onClick: () => navigate('/affaires/nouvelle'),
      variant: 'primary' as const,
    },
    {
      label: 'Ajouter audience',
      description: 'Planifier une audience',
      icon: Calendar,
      onClick: () => navigate('/agenda?action=new'),
      variant: 'default' as const,
    },
    {
      label: 'Renseigner résultat',
      description: 'Saisir un résultat',
      icon: FileText,
      onClick: () => navigate('/a-renseigner'),
      variant: 'default' as const,
    },
    {
      label: 'Voir demain',
      description: 'Préparer les audiences',
      icon: Clock,
      onClick: () => navigate('/demain'),
      variant: 'default' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={cn(
            "group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left",
            action.variant === 'primary' 
              ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" 
              : "bg-card border-border/50 hover:border-primary/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          )}
        >
          <div className={cn(
            "p-2.5 rounded-xl transition-transform group-hover:scale-110",
            action.variant === 'primary'
              ? "bg-primary-foreground/20"
              : "bg-muted"
          )}>
            <action.icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{action.label}</p>
            <p className={cn(
              "text-xs truncate",
              action.variant === 'primary' ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {action.description}
            </p>
          </div>
          <ArrowRight className={cn(
            "h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0",
            action.variant === 'primary' ? "text-primary-foreground/50" : "text-muted-foreground"
          )} />
        </button>
      ))}
    </div>
  );
}
