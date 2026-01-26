import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Users as UsersIcon, CheckCircle, XCircle, Shield, User } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface User {
  id: string;
  email: string;
  nomComplet: string;
  role: 'ADMIN' | 'COLLABORATEUR';
  estActif: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data: any = await api.getUsers();
      setUsers(data);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de charger les utilisateurs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.updateUserStatus(userId, !currentStatus);
      toast({
        title: 'Succès',
        description: `Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`,
      });
      loadUsers();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le statut',
        variant: 'destructive',
      });
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'ADMIN' | 'COLLABORATEUR') => {
    try {
      await api.updateUserRole(userId, newRole);
      toast({
        title: 'Succès',
        description: 'Rôle modifié avec succès',
      });
      loadUsers();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le rôle',
        variant: 'destructive',
      });
    }
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

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Gestion des utilisateurs"
          description="Gérer les comptes utilisateurs et leurs permissions"
        />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              <CardTitle>Utilisateurs ({users.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nomComplet}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value: 'ADMIN' | 'COLLABORATEUR') =>
                          handleChangeRole(user.id, value)
                        }
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Administrateur
                            </div>
                          </SelectItem>
                          <SelectItem value="COLLABORATEUR">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Collaborateur
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.estActif ? (
                        <Badge variant="default" className="bg-success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt
                        ? format(new Date(user.lastLoginAt), 'dd/MM/yyyy HH:mm', { locale: fr })
                        : 'Jamais'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={user.estActif ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleToggleStatus(user.id, user.estActif)}
                      >
                        {user.estActif ? 'Désactiver' : 'Activer'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
