
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { parse } from "date-fns"
import Link from "next/link"
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
import { Pencil, Trash2, Trophy, Users } from "lucide-react"
import { BolaoFormModal } from "@/components/bolao-form-modal"
import { ResultFormModal } from "@/components/result-form-modal"
import { useToast } from "@/hooks/use-toast"

export default function BoloesPage() {
  const searchParams = useSearchParams()
  const championshipIdFilter = searchParams.get("championshipId")

  const [boloes, setBoloes] = useState<Bolao[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [boloesData, teamsData, championshipsData] = await Promise.all([
        getBoloes(),
        getTeams(),
        getChampionships(),
      ])
      
      const filteredBoloes = championshipIdFilter 
        ? boloesData.filter(bolao => bolao.championshipId === championshipIdFilter)
        : boloesData;

      setBoloes(filteredBoloes)
      setTeams(teamsData)
      setChampionships(championshipsData)
    } catch (err) {
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível carregar a lista de bolões.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [championshipIdFilter])

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
        toast({
            title: "Sucesso!",
            description: `Bolão ${id ? 'atualizado' : 'criado'} com sucesso.`,
            variant: "success",
        });
    } catch (err) {
        toast({
            title: "Erro ao salvar",
            description: "Não foi possível salvar o bolão.",
            variant: "destructive",
        });
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBolao(id)
      fetchData();
      toast({
        title: "Bolão Deletado",
        description: "O bolão foi removido com sucesso.",
        variant: "success",
      })
    } catch (err) {
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível remover o bolão.",
        variant: "destructive",
      })
    }
  }
  
  const getNameById = (id: string, list: {id: string, name: string}[]) => {
    return list.find(item => item.id === id)?.name || "N/A"
  }

  const getTeamName = (id: string) => getNameById(id, teams);
  
  const getChampionshipName = (id: string) => getNameById(id, championships);

  const getDisplayStatus = (bolao: Bolao): Bolao['status'] => {
    if (bolao.status === 'Finalizado') return 'Finalizado';
    const closingDateTime = parse(`${bolao.matchDate} ${bolao.closingTime}`, 'yyyy-MM-dd HH:mm', new Date());
    if (new Date() > closingDateTime) return 'Chutes Encerrados';
    return bolao.status;
  };

  const statusVariant = (status: Bolao['status']) => {
    switch (status) {
      case 'Disponível': return 'success'
      case 'Chutes Encerrados': return 'secondary'
      case 'Finalizado': return 'destructive'
      default: return 'outline'
    }
  }
  
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">
                Gerenciamento de Bolões
            </h1>
            <p className="text-muted-foreground">
                {championshipIdFilter ? `Bolões do campeonato ${getChampionshipName(championshipIdFilter)}` : 'Adicione, edite e visualize os bolões da plataforma.'}
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
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resultados</TableHead>
                <TableHead>Ganhadores</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Carregando...</TableCell>
                </TableRow>
              ) : boloes.length > 0 ? (
                boloes.map(bolao => {
                    const displayStatus = getDisplayStatus(bolao);
                    
                    let winnerInfo = '';
                    // CORREÇÃO: Usando os campos corretos `finalScoreTeam1` e `finalScoreTeam2`
                    if (displayStatus === 'Finalizado' && bolao.finalScoreTeam1 !== undefined && bolao.finalScoreTeam2 !== undefined) {
                        if (bolao.finalScoreTeam1 > bolao.finalScoreTeam2) {
                            winnerInfo = `Vencedor: ${getTeamName(bolao.teamAId)}`;
                        } else if (bolao.finalScoreTeam2 > bolao.finalScoreTeam1) {
                            winnerInfo = `Vencedor: ${getTeamName(bolao.teamBId)}`;
                        } else {
                            winnerInfo = 'Empate';
                        }
                    }

                    return (
                        <TableRow key={bolao.id}>
                            <TableCell className="font-medium">{`${getTeamName(bolao.teamAId)} vs ${getTeamName(bolao.teamBId)}`}</TableCell>
                            <TableCell>{new Date(bolao.matchDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                            <TableCell>
                                <Badge variant={statusVariant(displayStatus)}>
                                    {displayStatus}
                                </Badge>
                            </TableCell>
                            <TableCell>
                            {displayStatus === 'Finalizado' ? (
                                <div>
                                    <span className="font-bold">{`${bolao.finalScoreTeam1} x ${bolao.finalScoreTeam2}`}</span>
                                    <p className="text-xs text-muted-foreground">{winnerInfo}</p>
                                </div>
                            ) : (
                                <ResultFormModal bolao={{...bolao, teamA: getTeamName(bolao.teamAId), teamB: getTeamName(bolao.teamBId) }} onResultSubmitted={fetchData}>
                                <Button variant="outline" size="sm" disabled={displayStatus !== 'Chutes Encerrados'}>
                                    <Trophy className="mr-2 h-4 w-4" />
                                    Lançar Placar
                                </Button>
                                </ResultFormModal>
                            )}
                            </TableCell>
                            <TableCell>
                                {displayStatus === 'Finalizado' && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/boloes/${bolao.id}/ganhadores`}>
                                            <Users className="mr-2 h-4 w-4" />
                                            Ver
                                        </Link>
                                    </Button>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                            <BolaoFormModal
                                bolao={bolao}
                                onSave={handleSave}
                            >
                                <Button variant="ghost" size="icon" disabled={displayStatus === 'Finalizado'}>
                                <Pencil className="h-4 w-4" />
                                </Button>
                            </BolaoFormModal>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={displayStatus !== 'Finalizado'}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    Essa ação não pode ser desfeita e irá remover o bolão permanentemente.
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
                    )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
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
