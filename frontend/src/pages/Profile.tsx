import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, Mail, Shield, Calendar, Clock, Monitor } from 'lucide-react';
import type { User as UserType } from '@/types/api';

export default function Profile() {
  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ['profile'],
    queryFn: () => api.getMe(),
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div>
          <div className="card-elevated p-8 text-center text-muted-foreground">
            Chargement...
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div>
          <div className="card-elevated p-8 text-center">
            <p className="text-muted-foreground">Impossible de charger le profil</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Mon profil"
          description="Gérer vos informations personnelles"
        />

        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar et nom */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground">{user.fullName}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <Badge
                variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {user.role === 'ADMIN' ? 'Administrateur' : 'Collaborateur'}
              </Badge>
            </div>

            {/* Détails */}
            <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <p className="font-medium">{user.email}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Rôle</span>
                </div>
                <p className="font-medium">
                  {user.role === 'ADMIN' ? 'Administrateur' : 'Collaborateur'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Membre depuis</span>
                </div>
                <p className="font-medium">
                  {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>

              {user.lastLoginAt && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Dernière connexion</span>
                  </div>
                  <p className="font-medium">
                    {format(new Date(user.lastLoginAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations de connexion */}
        {(user.lastLoginIp || user.lastLoginUserAgent) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Dernière connexion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.lastLoginIp && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Adresse IP</p>
                  <p className="font-mono text-sm">{user.lastLoginIp}</p>
                </div>
              )}
              {user.lastLoginUserAgent && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Navigateur</p>
                  <p className="text-sm text-muted-foreground break-all">
                    {user.lastLoginUserAgent}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-serif">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" disabled>
              Modifier mes informations
              <span className="ml-auto text-xs text-muted-foreground">Bientôt disponible</span>
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              Changer mon mot de passe
              <span className="ml-auto text-xs text-muted-foreground">Bientôt disponible</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
