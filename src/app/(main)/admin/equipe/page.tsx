
"use client"

import { useState, useEffect } from "react"
import { httpsCallable } from "firebase/functions"
import { functions } from "@/lib/firebase"
import { getAllUsers } from "@/services/users"
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

// Definindo as funções que podem ser atribuídas
const ROLES = ["admin", "editor", "support"]

export default function TeamManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMemberUid, setNewMemberUid] = useState("")
  const [newMemberRole, setNewMemberRole] = useState("support")
  const { toast } = useToast()

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
      // Filtra para exibir apenas usuários que têm uma role definida
      const team = allUsers.filter(u => u.role && ROLES.includes(u.role))
      setTeamMembers(team)
    } catch (error) {
      toast({
        title: "Erro ao carregar usuários",
        description:
          "Não foi possível buscar a lista de usuários da plataforma.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSetRole = async (uid: string, role: string) => {
    try {
      const setUserRole = httpsCallable(functions, "setUserRole")
      await setUserRole({ uid, role })
      toast({
        title: "Sucesso!",
        description: `A função do usuário foi definida como ${role}.`,
        variant: "default",
      })
      fetchUsers() // Atualiza a lista após a alteração
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberUid.trim()) {
      toast({
        title: "UID Inválido",
        description: "Por favor, insira um UID válido.",
        variant: "destructive",
      })
      return
    }
    handleSetRole(newMemberUid, newMemberRole)
    setNewMemberUid("") // Limpa o campo após a tentativa
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Gerenciamento de Equipe
          </h1>
          <p className="text-muted-foreground">
            Adicione e gerencie as permissões dos membros da equipe
            administrativa.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Membros da Equipe</CardTitle>
              <CardDescription>
                Lista de usuários com permissões administrativas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função (Role)</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : teamMembers.length > 0 ? (
                    teamMembers.map(user => (
                      <TableRow key={user.uid}>
                        <TableCell>{user.displayName || "N/A"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "secondary"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Alterar Função
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Alterar função de {user.displayName}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Selecione a nova função para o usuário. Essa
                                  ação terá efeito imediato.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <Select
                                onValueChange={role =>
                                  handleSetRole(user.uid, role)
                                }
                                defaultValue={user.role}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLES.map(role => (
                                    <SelectItem key={role} value={role}>
                                      {role}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Nenhum membro na equipe ainda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Membro</CardTitle>
              <CardDescription>
                Cole o UID do usuário para adicioná-lo à equipe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <Label htmlFor="uid">UID do Usuário</Label>
                  <Input
                    id="uid"
                    value={newMemberUid}
                    onChange={e => setNewMemberUid(e.target.value)}
                    placeholder="Cole o UID aqui"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select
                    onValueChange={setNewMemberRole}
                    defaultValue={newMemberRole}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(role => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Adicionar à Equipe
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
