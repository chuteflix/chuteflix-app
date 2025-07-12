
"use client"

import { useState, useEffect } from "react"
import {
  addBolao,
  getBoloes,
  updateBolao,
  deleteBolao,
  Bolao,
} from "@/services/boloes"
import { getTeams, Team } from "@/services/teams"
import { getChampionships, Championship } from "@/services/championships"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import { BolaoFormModal } from "@/components/bolao-form-modal"

export default function BoloesPage() {
  const [boloes, setBoloes] = useState<Bolao[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [boloesData, teamsData, championshipsData] = await Promise.all([
        getBoloes(),
        getTeams(),
        getChampionships(),
      ])
      setBoloes(boloesData)
      setTeams(teamsData)
      setChampionships(championshipsData)
    } catch (err) {
      setError("Falha ao buscar dados.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSave = async (data: Omit<Bolao, "id" | "status" | "name">, id?: string) => {
    try {
        const teamA = teams.find(t => t.id === data.teamAId)
        const teamB = teams.find(t => t.id === data.teamBId)
        const championship = championships.find(c => c.id === data.championshipId)

        if(!teamA || !teamB || !championship) {
            throw new Error("Dados inválidos para criar o nome do bolão.")
        }
        
        const name = `${teamA.name} vs ${teamB.name} - ${championship.name}`
        const bolaoData = { ...data, name }

        if (id) {
            await updateBolao(id, bolaoData);
        } else {
            await addBolao(bolaoData);
        }
        fetchData();
    } catch (err) {
        setError("Falha ao salvar bolão.");
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBolao(id)
      fetchData();
    } catch (err) {
      setError("Falha ao deletar bolão.")
    }
  }
  
  const getNameById = (id: string, list: {id: string, name: string}[]) => {
    return list.find(item => item.id === id)?.name || "N/A"
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">
                Gerenciamento de Bolões
            </h1>
            <p className="text-muted-foreground">
                Adicione, edite e visualize os bolões da plataforma.
            </p>
        </div>
        <BolaoFormModal onSave={handleSave}>
            <Button>Adicionar Bolão</Button>
        </BolaoFormModal>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bolões Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os bolões no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partida</TableHead>
                <TableHead>Campeonato</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Aposta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Carregando...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                    <TableCell colSpan={7} className="text-center text-red-500">{error}</TableCell>
                </TableRow>
              ) : boloes.length > 0 ? (
                boloes.map(bolao => (
                  <TableRow key={bolao.id}>
                    <TableCell className="font-medium">{`${getNameById(bolao.teamAId, teams)} vs ${getNameById(bolao.teamBId, teams)}`}</TableCell>
                    <TableCell>{getNameById(bolao.championshipId, championships)}</TableCell>
                    <TableCell>{new Date(bolao.matchDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                    <TableCell>{`${bolao.startTime} - ${bolao.endTime}`}</TableCell>
                    <TableCell>R$ {bolao.fee.toFixed(2)}</TableCell>
                    <TableCell>
                        <Badge variant={bolao.status === 'Ativo' ? 'default' : bolao.status === 'Em breve' ? 'outline' : 'secondary'}>
                            {bolao.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <BolaoFormModal
                        bolao={bolao}
                        onSave={handleSave}
                      >
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </BolaoFormModal>

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
                            <AlertDialogAction onClick={() => handleDelete(bolao.id)}>
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
                  <TableCell colSpan={7} className="text-center">
                    Nenhum bolão encontrado.
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
