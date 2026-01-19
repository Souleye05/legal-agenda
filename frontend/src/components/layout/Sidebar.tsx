import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Briefcase, 
  AlertTriangle, 
  CalendarCheck,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Scale,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeVariant?: 'default' | 'urgent';
}

interface SidebarProps {
  unreportedCount?: number;
  tomorrowCount?: number;
}

export function Sidebar({ unreportedCount = 0, tomorrowCount = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      label: 'Tableau de bord',
      href: '/',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: 'Agenda',
      href: '/agenda',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      label: 'Affaires',
      href: '/affaires',
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      label: 'À renseigner',
      href: '/a-renseigner',
      icon: <AlertTriangle className="h-5 w-5" />,
      badge: unreportedCount,
      badgeVariant: 'urgent',
    },
    {
      label: 'Demain',
      href: '/demain',
      icon: <CalendarCheck className="h-5 w-5" />,
      badge: tomorrowCount,
    },
  ];

  const settingsItems: NavItem[] = [
    {
      label: 'Utilisateurs',
      href: '/utilisateurs',
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: 'Paramètres',
      href: '/parametres',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-primary">
            <Scale className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">Agenda</span>
              <span className="text-xs text-sidebar-foreground/60">Juridique</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "nav-link",
              isActive(item.href) && "nav-link-active"
            )}
          >
            {item.icon}
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge 
                    variant={item.badgeVariant === 'urgent' ? 'destructive' : 'secondary'}
                    className={cn(
                      "ml-auto",
                      item.badgeVariant === 'urgent' && "bg-urgent text-urgent-foreground pulse-urgent"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-sidebar-border">
          {!collapsed && (
            <span className="px-3 text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider">
              Administration
            </span>
          )}
          <div className="mt-2 space-y-1">
            {settingsItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "nav-link",
                  isActive(item.href) && "nav-link-active"
                )}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-foreground">MA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Me Avocat</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">Administrateur</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Réduire</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
