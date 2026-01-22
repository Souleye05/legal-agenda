import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  AlertCircle,
  Sparkles,
  Settings,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch unreported hearings for alerts
  const { data: unreportedHearings = [] } = useQuery({
    queryKey: ["unreported-hearings"],
    queryFn: () => api.getUnreportedHearings(),
    refetchInterval: 60000,
  });

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  // Get first name from full name
  const getFirstName = () => {
    return user?.fullName?.split(" ")[0] || "Utilisateur";
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/affaires?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-20 items-center justify-between px-6">
        {/* Welcome Message */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <div className="relative p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm text-muted-foreground font-medium">
              {getGreeting()},
            </p>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {getFirstName()}
            </h1>
          </div>
        </div>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary pointer-events-none" />
            <Input
              type="search"
              placeholder="Rechercher une affaire, audience..."
              className="pl-12 pr-4 h-12 w-full bg-muted/50 border-muted-foreground/20 rounded-xl transition-all focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {/* Alerts */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-11 w-11 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <Bell className="h-5 w-5" />
                {unreportedHearings.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold shadow-lg animate-pulse"
                  >
                    {unreportedHearings.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Alertes & Notifications
                </SheetTitle>
                <SheetDescription>
                  Audiences non renseignées nécessitant votre attention
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                {unreportedHearings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full"></div>
                      <Bell className="relative h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    </div>
                    <p className="text-lg font-medium text-muted-foreground">Aucune alerte</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Tout est à jour ! 🎉</p>
                  </div>
                ) : (
                  <>
                    {unreportedHearings.map((hearing: any) => (
                      <div
                        key={hearing.id}
                        className="group flex items-start space-x-3 p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30 cursor-pointer transition-all duration-200 hover:shadow-md"
                        onClick={() => navigate("/a-renseigner")}
                      >
                        <div className="p-2 bg-destructive/10 rounded-lg group-hover:bg-destructive/20 transition-colors">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">
                            {hearing.affaire?.titre || "Affaire sans titre"}
                          </p>
                          <p className="text-sm text-muted-foreground font-medium">
                            {hearing.affaire?.reference}
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            📅 {new Date(hearing.date).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="default"
                      className="w-full mt-4 rounded-xl h-11 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => navigate("/a-renseigner")}
                    >
                      Voir toutes les alertes ({unreportedHearings.length})
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-11 rounded-xl hover:bg-primary/10 px-3 transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold shadow-md">
                    {user?.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold leading-none">
                      {getFirstName()}
                    </p>
                    <p className="text-xs text-muted-foreground leading-none mt-1">
                      {user?.email?.split("@")[0]}
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              <DropdownMenuLabel className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
                    {user?.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-none truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground leading-none mt-1.5 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer rounded-lg py-2.5"
                onClick={() => navigate("/profil")}
              >
                <User className="mr-3 h-4 w-4" />
                <span className="font-medium">Mon Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5" disabled>
                <Settings className="mr-3 h-4 w-4" />
                <span className="font-medium">Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="cursor-pointer text-destructive focus:text-destructive rounded-lg py-2.5 font-medium"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}