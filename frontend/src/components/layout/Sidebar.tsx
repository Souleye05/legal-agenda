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
  LogOut,
  File,
  Sparkles,
  Crown,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

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
  enrollmentCount?: number;
  appealCount?: number;
  className?: string;
  onItemClick?: () => void;
}

export function Sidebar({
  unreportedCount = 0,
  tomorrowCount = 0,
  enrollmentCount = 0,
  appealCount = 0,
  className,
  onItemClick
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

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
    {
      label: 'Rappels enrôlement',
      href: '/rappels-enrolement',
      icon: <ClipboardList className="h-5 w-5" />,
      badge: enrollmentCount,
    },
    {
      label: 'Recours à faire',
      href: '/recours',
      icon: <Scale className="h-5 w-5" />,
      badge: appealCount,
    },
    {
      label: 'Comptes rendus',
      href: '/comptes-rendus',
      icon: <File className="h-5 w-5" />,
    }
  ];

  const settingsItems: NavItem[] = [
    ...(user?.role === 'ADMIN' ? [{
      label: 'Utilisateurs',
      href: '/utilisateurs',
      icon: <Users className="h-5 w-5" />,
    }] : []),
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

  const getInitials = () => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.fullName[0].toUpperCase();
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 border-r border-sidebar-border/50 transition-all duration-300 shadow-xl",
        collapsed ? "w-[70px]" : "w-64",
        className
      )}
    >
      {/* Logo avec effet glassmorphism */}
      <div className="flex items-center h-20 px-4 border-b border-sidebar-border/30 bg-sidebar/50 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-3 w-full group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-xl group-hover:blur-xl transition-all"></div>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-200">
              <Scale className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold text-sidebar-foreground group-hover:text-primary transition-colors">
                Legal Agenda
              </span>
              <span className="text-xs text-sidebar-foreground/60 font-medium">
                Gestion Juridique
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
        {/* Section principale */}
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onItemClick}
              className={cn(
                "group flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                "hover:bg-sidebar-accent/80 hover:shadow-md",
                isActive(item.href)
                  ? "bg-white text-primary font-bold shadow-lg border-2 border-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
            >
              {/* Indicateur actif */}
              {isActive(item.href) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary rounded-r-full shadow-lg"></div>
              )}

              <div className={cn(
                "flex items-center justify-center transition-transform group-hover:scale-110",
                isActive(item.href) && "text-primary"
              )}>
                {item.icon}
              </div>

              {!collapsed && (
                <>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                      variant={item.badgeVariant === 'urgent' ? 'destructive' : 'secondary'}
                      className={cn(
                        "ml-auto h-6 px-2 text-xs font-bold shadow-md",
                        item.badgeVariant === 'urgent' && "bg-destructive/90 text-destructive-foreground animate-pulse"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}

              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
                  <span className="text-[10px] font-bold text-destructive-foreground">{item.badge}</span>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Section Administration */}
        <div className="pt-6 mt-6 border-t border-sidebar-border/30">
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 mb-3">
              <Crown className="h-3.5 w-3.5 text-sidebar-foreground/40" />
              <span className="text-xs font-bold text-sidebar-foreground/40 uppercase tracking-wider">
                Administration
              </span>
            </div>
          )}
          <div className="space-y-1">
            {settingsItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                  "hover:bg-sidebar-accent/80 hover:shadow-md",
                  isActive(item.href)
                    ? "bg-white text-primary font-bold shadow-lg border-2 border-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                )}
              >
                {isActive(item.href) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary rounded-r-full shadow-lg"></div>
                )}

                <div className={cn(
                  "flex items-center justify-center transition-transform group-hover:scale-110",
                  isActive(item.href) && "text-primary"
                )}>
                  {item.icon}
                </div>

                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer avec profil utilisateur */}
      <div className="p-4 border-t border-sidebar-border/30 bg-sidebar/50 backdrop-blur-sm space-y-3">
        {/* Profil utilisateur */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-accent/50 hover:bg-sidebar-accent transition-all duration-200 cursor-pointer group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-md rounded-full"></div>
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                <span className="text-sm font-bold text-primary-foreground">
                  {getInitials()}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {user?.fullName || 'Utilisateur'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate font-medium">
                {user?.role === 'ADMIN' ? 'Administrateur' : 'Collaborateur'}
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-primary/20 blur-md rounded-full"></div>
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                <span className="text-sm font-bold text-primary-foreground">
                  {getInitials()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bouton réduire/agrandir */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl h-10 font-medium transition-all duration-200 hover:shadow-md",
            collapsed && "px-0"
          )}
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