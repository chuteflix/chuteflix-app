
"use client"

import { useState, useEffect } from "react"
import {
  addTeam,
  getTeams,
  updateTeam,
  deleteTeam,
  Team,
} from "@/services/teams"
import { getChampionships, Championship } from "@/services/championships"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
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
import { Pencil, Trash2 } from "lucide-react"
import { TeamEditModal } from "@/components/team-edit-modal"

export default function TimesPage() {
  const [teamName, setTeamName] = useState("")
  const [selectedChampionship, setSelectedChampionship] = useState("")
  const [teams, setTeams] = useState<Team[]>([])
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [teamsData, championshipsData] = await Promise.all([
          getTeams(),
          getChampionships(),
        ])
        setTeams(teamsData)
        setChampionships(championshipsData)
      } catch (err) {
        setError("Falha ao buscar dados.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!teamName.trim() || !selectedChampionship) {
      setError("Nome do time e campeonato são obrigatórios.")
      return
    }
    try {
      const newTeam = await addTeam(teamName, selectedChampionship)
      setTeams(prev => [...prev, newTeam])
      setTeamName("")
      setSelectedChampionship("")
    } catch (err) {
      setError("Falha ao adicionar time.")
      console.error(err)
    }
  }

  const handleUpdate = async (id: string, newName: string, newChampionshipId: string) => {
    try {
      await updateTeam(id, newName, newChampionshipId)
      setTeams(prev =>
        prev.map(t =>
          t.id === id ? { ...t, name: newName, championshipId: newChampionshipId } : t
        )
      )
    } catch (err) {
      setError("Falha ao atualizar time.")
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTeam(id)
      setTeams(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      setError("Falha ao deletar time.")
      console.error(err)
    }
  }

  const getChampionshipName = (id: string) => {
    return championships.find(c => c.id === id)?.name || "N/A"
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Gerenciamento de Times</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Time</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSubmit}>
                <Input
                  placeholder="Nome do Time"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  className="mb-4"
                />
                <Select
                  onValueChange={setSelectedChampionship}
                  value={selectedChampionship}
                >
                  <SelectTrigger className="mb-4">
                    <SelectValue placeholder="Selecione o Campeonato" />
                  </SelectTrigger>
                  <SelectContent>
                    {championships.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit">Adicionar</Button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Times Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Campeonato</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">Carregando...</TableCell></TableRow>
                  ) : teams.length > 0 ? (
                    teams.map(team => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>{getChampionshipName(team.championshipId)}</TableCell>
                        <TableCell className="text-right">
                          <TeamEditModal
                            team={team}
                            championships={championships}
                            onTeamUpdated={handleUpdate}
                          >
                            <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                          </TeamEditModal>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa ação não pode ser desfeita. Isso irá deletar o time permanentemente.
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
                    <TableRow><TableCell colSpan={3} className="text-center">Nenhum time encontrado.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
