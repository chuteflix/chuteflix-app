
"use client"

import { useState, useEffect } from "react"
import {
  addTeam,
  getTeams,
  updateTeam,
  deleteTeam,
  Team,
  TeamData, // Importar TeamData
} from "@/services/teams"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pencil, Trash2 } from "lucide-react"
import { TeamFormModal } from "@/components/team-form-modal"
import { useToast } from "@/hooks/use-toast"

export default function TimesPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const teamsData = await getTeams()
      setTeams(teamsData)
    } catch (err) {
      toast({
        title: "Erro ao buscar times",
        description: (err as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // A função de salvar agora usa TeamData
  const handleSaveTeam = async (data: TeamData, id?: string) => {
    try {
      if (id) {
        await updateTeam(id, data)
        toast({ title: "Sucesso", description: "Time atualizado com sucesso." })
      } else {
        await addTeam(data)
        toast({ title: "Sucesso", description: "Time adicionado com sucesso." })
      }
      fetchData() // Recarrega os dados após salvar
    } catch (err) {
      toast({
        title: "Erro ao salvar time",
        description: (err as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTeam(id)
      toast({ title: "Sucesso", description: "Time deletado com sucesso." })
      fetchData() // Recarrega os dados após deletar
    } catch (err) {
      toast({
        title: "Erro ao deletar time",
        description: (err as Error).message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Gerenciamento de Times
          </h1>
          <p className="text-muted-foreground">
            Adicione, edite e visualize os times da plataforma.
          </p>
        </div>
        {/* Passa a nova função para o modal */}
        <TeamFormModal onSave={handleSaveTeam}>
          <Button>Adicionar Time</Button>
        </TeamFormModal>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Times Cadastrados</CardTitle>
          <CardDescription>Lista de todos os times no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Local</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : teams.length > 0 ? (
                teams.map(team => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={team.shieldUrl} alt={team.name} />
                        <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {team.name}
                    </TableCell>
                    <TableCell>
                      {team.city ? `${team.city}, ${team.state}` : team.state || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* O modal de edição também usa a nova função */}
                      <TeamFormModal team={team} onSave={handleSaveTeam}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TeamFormModal>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(team.id)}>
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Nenhum time encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
