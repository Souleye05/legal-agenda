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
  File,
  Crown,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import logoCabinet from '@/assets/logo-cabinet.png';

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
    }, {
      label: 'Journal d\'audit',
      href: '/journal-audit',
      icon: <ClipboardList className="h-5 w-5" />,
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
        "flex flex-col h-screen bg-black border-r border-gray-800 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-64",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-24 px-4 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-3 w-full group">
          {!collapsed ? (
            <img 
              src={logoCabinet} 
              alt="Cabinet Me Ibrahima Niang" 
              className="h-20 w-auto object-contain"
            />
          ) : (
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white overflow-hidden">
              <img 
                src={logoCabinet} 
                alt="Cabinet" 
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {/* Section principale */}
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onItemClick}
              className={cn(
                "group flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all duration-200",
                isActive(item.href)
                  ? "bg-white text-black font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-gray-900"
              )}
            >
              <div className="flex items-center justify-center">
                {item.icon}
              </div>
              
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge 
                      variant={item.badgeVariant === 'urgent' ? 'destructive' : 'secondary'}
                      className={cn(
                        "ml-auto h-6 px-2 text-xs font-bold",
                        item.badgeVariant === 'urgent' && "bg-orange-500 text-white"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
              
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{item.badge}</span>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Section Administration */}
        {settingsItems.length > 0 && (
          <div className="pt-6 mt-6 border-t border-gray-800">
            {!collapsed && (
              <div className="flex items-center gap-2 px-3 mb-3">
                <Crown className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
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
                    "group flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all duration-200",
                    isActive(item.href)
                      ? "bg-white text-black font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-gray-900"
                  )}
                >
                  <div className="flex items-center justify-center">
                    {item.icon}
                  </div>
                  
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer avec profil utilisateur */}
      <div className="p-4 border-t border-gray-800 space-y-3">
        {/* Profil utilisateur */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-900 hover:bg-gray-800 transition-all duration-200 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="text-sm font-bold text-black">
                {getInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.fullName || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-400 truncate font-medium">
                {user?.role === 'ADMIN' ? 'Administrateur' : 'Collaborateur'}
              </p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer hover:scale-105 transition-all">
              <span className="text-sm font-bold text-black">
                {getInitials()}
              </span>
            </div>
          </div>
        )}
        
        {/* Bouton réduire/agrandir */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full justify-center text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg h-10 font-medium transition-all duration-200",
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
