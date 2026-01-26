import { PlusCircle, Calendar, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Nouvelle affaire',
      icon: Plus,
      onClick: () => navigate('/affaires/nouvelle'),
      color: 'text-primary',
    },
    {
      label: 'Ajouter audience',
      icon: Calendar,
      onClick: () => navigate('/agenda?action=new'),
      color: 'text-accent',
    },
    {
      label: 'Renseigner résultat',
      icon: FileText,
      onClick: () => navigate('/a-renseigner'),
      color: 'text-urgent',
    },
    {
      label: 'Voir demain',
      icon: Clock,
      onClick: () => navigate('/demain'),
      color: 'text-success',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="quick-action group"
        >
          <div className={`p-3 rounded-xl bg-muted group-hover:scale-110 transition-transform ${action.color}`}>
            <action.icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-foreground">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
