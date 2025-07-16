
"use client"

import { useState, useEffect } from "react"
import { getAllUsers, UserProfile, updateUserProfile } from "@/services/users"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil } from "lucide-react"
import { UserEditModal } from "@/components/user-edit-modal"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const fetchedUsers = await getAllUsers()
        setUsers(fetchedUsers)
      } catch (err) {
        setError("Falha ao buscar usuários.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const handleAdminStatusChange = async (uid: string, isAdmin: boolean) => {
    try {
      await updateUserProfile(uid, { isAdmin })
      setUsers(prevUsers =>
        prevUsers.map(u => (u.uid === uid ? { ...u, isAdmin } : u))
      )
      toast({
        title: "Sucesso!",
        description: `Usuário ${
          isAdmin ? "promovido a" : "rebaixado para"
        } ${isAdmin ? "Admin" : "Usuário"}.`,
      })
    } catch (err) {
      setError("Falha ao atualizar o status do usuário.")
      console.error(err)
    }
  }

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setUsers(prevUsers =>
      prevUsers.map(u => (u.uid === updatedUser.uid ? updatedUser : u))
    )
  }

  const getFullName = (user: UserProfile) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.displayName || "N/A"
  }

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
          <CardTitle>Usuários Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os usuários no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : users.length > 0 ? (
                  users.map(user => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">
                        {getFullName(user)}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.createdAt ? format(new Date(user.createdAt.seconds * 1000), "dd/MM/yyyy HH:mm") : 'N/A'}</TableCell>
                      <TableCell>{(user.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Badge>Admin</Badge>
                        ) : (
                          <Badge variant="outline">Usuário</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
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
                              >
                                Rebaixar para Usuário
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAdminStatusChange(user.uid, true)
                                }
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
                    <TableCell colSpan={6} className="text-center">
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
  )
}
