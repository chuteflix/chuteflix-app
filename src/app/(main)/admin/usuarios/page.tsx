"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllUsers } from "@/services/users";
import { UserProfile } from "@/types"; // Corrected import path
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Search, Users, Loader2, Phone } from "lucide-react";
import { UserEditModal } from "@/components/user-edit-modal";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      fetchedUsers.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setUsers(fetchedUsers);
    } catch (err) {
      toast({ title: "Erro ao buscar usuários.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return users;
    }
    return users.filter(user => {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const email = user.email.toLowerCase();
      const term = searchTerm.toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [searchTerm, users]);

  const handleAdminStatusChange = async (uid: string, isAdmin: boolean) => {
    setIsSubmitting(uid);
    try {
      const setUserRole = httpsCallable(functions, 'setUserRole');
      await setUserRole({ targetUserId: uid, isAdmin: isAdmin });

      setUsers(prevUsers =>
        prevUsers.map(u => (u.uid === uid ? { ...u, isAdmin } : u))
      );
      
      if (isAdmin) {
        toast({
            title: "Usuário Promovido!",
            description: "Peça para que ele(a) faça logout e login novamente para ativar as permissões de admin.",
            duration: 7000, 
        });
      } else {
        toast({
            title: "Usuário Rebaixado.",
            description: "As permissões de admin foram removidas.",
            variant: "default", // Changed from "info" to "default"
        });
      }

    } catch (err: any) {
      toast({ title: "Erro ao alterar permissão.", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setUsers(prevUsers =>
      prevUsers.map(u => (u.uid === updatedUser.uid ? updatedUser : u))
    );
    fetchUsers();
  };

  const getFullName = (user: UserProfile) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.displayName || "N/A";
  };
  
  const handleWhatsAppClick = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    } else {
      toast({ title: "Número de telefone inválido.", variant: "default" }); // Changed from "warning" to "default"
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-foreground">
        Gerenciamento de Usuários
      </h1>
      <p className="text-muted-foreground mb-8">
        Visualize e gerencie as permissões dos usuários da plataforma.
      </p>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Usuários Cadastrados</CardTitle>
                    <CardDescription>
                        Abaixo está a lista de todos os usuários registrados no sistema.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-lg">
                    <Users className="h-8 w-8 text-primary" />
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total de Usuários</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Pesquisar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Data de Cadastro</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">WhatsApp</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        {user.createdAt ? format(new Date(user.createdAt.seconds * 1000), "dd/MM/yyyy 'às' HH:mm") : 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getFullName(user)}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-right">{(user.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                      <TableCell className="text-center">
                        {isSubmitting === user.uid ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          <Badge variant={user.isAdmin ? "success" : "outline"}>
                            {user.isAdmin ? "Admin" : "Usuário"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                          {user.phone ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="font-mono text-sm">{user.phone}</span>
                                <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleWhatsAppClick(user.phone!)}
                                            aria-label="Contatar no WhatsApp"
                                            disabled={isSubmitting === user.uid}
                                        >
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Contatar via WhatsApp</p>
                                    </TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                            </div>
                          ) : (
                              <span className="text-xs text-muted-foreground">Não cadastrado</span>
                          )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                          aria-label="Editar Usuário"
                          disabled={isSubmitting === user.uid}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Mais Ações" disabled={isSubmitting === user.uid}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user.isAdmin ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAdminStatusChange(user.uid, false)
                                }
                                disabled={isSubmitting === user.uid}
                              >
                                Rebaixar para Usuário
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAdminStatusChange(user.uid, true)
                                }
                                disabled={isSubmitting === user.uid}
                              >
                                Promover a Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <UserEditModal
        user={selectedUser}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
}
