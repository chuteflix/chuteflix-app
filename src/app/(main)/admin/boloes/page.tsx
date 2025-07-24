"use client"

import { useState, useEffect } from "react"
import { useSearchParams }
 from "next/navigation"
import Link from "next/link"
import {
  addBolao,
  getBoloes,
  updateBolao,
  deleteBolao,
} from "@/services/boloes"
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
import { Pencil, Trash2, Trophy, Users, Loader2 } from "lucide-react"
import { BolaoFormModal } from "@/components/bolao-form-modal"
import { ResultFormModal } from "@/components/result-form-modal"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { format, isPast, isValid } from "date-fns"
import { Bolao } from "@/types"

export default function BoloesPage() {
  const searchParams = useSearchParams()
  const championshipIdFilter = searchParams.get("championshipId")

  const [boloes, setBoloes] = useState<Bolao[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    try {
      let boloesData = await getBoloes()
      
      if (championshipIdFilter) {
        boloesData = boloesData.filter(bolao => bolao.championshipId === championshipIdFilter)
      }

      setBoloes(boloesData)
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

  const handleSave = async (data: Omit<Bolao, "id" | "status">, id?: string) => {
    try {
        if (id) {
            await updateBolao(id, data);
        } else {
            await addBolao(data);
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
  
  const getDisplayStatus = (bolao: Bolao): 'Aberto' | 'Fechado' | 'Finalizado' => {
    if (bolao.status === 'Finalizado') return 'Finalizado';
    
    const closingDate = new Date(bolao.closingTime);

    if(isValid(closingDate) && isPast(closingDate)) return 'Fechado';

    return 'Aberto';
  };

  const statusVariant = (status: 'Aberto' | 'Fechado' | 'Finalizado') => {
    switch (status) {
      case 'Aberto': return 'success'
      case 'Fechado': return 'secondary'
      case 'Finalizado': return 'destructive'
      default: return 'outline'
    }
  }
  
  const activeBoloes = boloes.filter(bolao => getDisplayStatus(bolao) !== 'Finalizado');
  const finishedBoloes = boloes.filter(bolao => getDisplayStatus(bolao) === 'Finalizado');

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
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Encerramento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resultados</TableHead>
                <TableHead>Ganhadores</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin"/></TableCell></TableRow>
              ) : activeBoloes.length > 0 ? (
                activeBoloes.map(bolao => {
                    const displayStatus = getDisplayStatus(bolao);
                    const homeTeamName = bolao.homeTeam?.name || "Time A";
                    const awayTeamName = bolao.awayTeam?.name || "Time B";
                    
                    return (
                        <TableRow key={bolao.id}>
                            <TableCell className="font-medium">{`${homeTeamName} vs ${awayTeamName}`}</TableCell>
                            <TableCell>{bolao.categoryNames?.join(', ')}</TableCell>
                            <TableCell>
                                {bolao.matchStartDate && isValid(new Date(bolao.matchStartDate))
                                ? format(new Date(bolao.matchStartDate), "dd/MM/yyyy")
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                                {bolao.closingTime && isValid(new Date(bolao.closingTime))
                                ? format(new Date(bolao.closingTime), "dd/MM/yyyy 'às' HH:mm")
                                : 'N/A'}
                            </TableCell>
                            <TableCell><Badge variant={statusVariant(displayStatus)}>{displayStatus}</Badge></TableCell>
                            <TableCell>
                            {displayStatus === 'Finalizado' ? (
                                <span>{`${bolao.finalScoreTeam1 ?? '-'} x ${bolao.finalScoreTeam2 ?? '-'}`}</span>
                            ) : (
                                <ResultFormModal bolao={bolao} onResultSubmitted={fetchData}>
                                    <Button variant="outline" size="sm" disabled={displayStatus !== 'Fechado'}>
                                        <Trophy className="mr-2 h-4 w-4" /> Lançar
                                    </Button>
                                </ResultFormModal>
                            )}
                            </TableCell>
                            <TableCell>
                                {displayStatus === 'Finalizado' && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/boloes/${bolao.id}/ganhadores`}><Users className="mr-2 h-4 w-4" />Ver</Link>
                                    </Button>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <BolaoFormModal bolao={bolao} onSave={handleSave}>
                                    <Button variant="ghost" size="icon" disabled={displayStatus === 'Finalizado'}><Pencil className="h-4 w-4" /></Button>
                                </BolaoFormModal>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" disabled={displayStatus === 'Finalizado'}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(bolao.id)}>Deletar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    )
                })
              ) : (
                <TableRow><TableCell colSpan={8} className="text-center h-24">Nenhum bolão encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Histórico de Bolões</CardTitle>
          <CardDescription>
            Lista de todos os bolões finalizados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partida</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Encerramento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resultados</TableHead>
                <TableHead>Ganhadores</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin"/></TableCell></TableRow>
              ) : finishedBoloes.length > 0 ? (
                finishedBoloes.map(bolao => {
                    const displayStatus = getDisplayStatus(bolao);
                    const homeTeamName = bolao.homeTeam?.name || "Time A";
                    const awayTeamName = bolao.awayTeam?.name || "Time B";
                    
                    return (
                        <TableRow key={bolao.id}>
                            <TableCell className="font-medium">{`${homeTeamName} vs ${awayTeamName}`}</TableCell>
                            <TableCell>{bolao.categoryNames?.join(', ')}</TableCell>
                            <TableCell>
                                {bolao.matchStartDate && isValid(new Date(bolao.matchStartDate))
                                ? format(new Date(bolao.matchStartDate), "dd/MM/yyyy")
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                                {bolao.closingTime && isValid(new Date(bolao.closingTime))
                                ? format(new Date(bolao.closingTime), "dd/MM/yyyy 'às' HH:mm")
                                : 'N/A'}
                            </TableCell>
                            <TableCell><Badge variant={statusVariant(displayStatus)}>{displayStatus}</Badge></TableCell>
                            <TableCell>
                            {displayStatus === 'Finalizado' ? (
                                <span>{`${bolao.finalScoreTeam1 ?? '-'} x ${bolao.finalScoreTeam2 ?? '-'}`}</span>
                            ) : (
                                <ResultFormModal bolao={bolao} onResultSubmitted={fetchData}>
                                    <Button variant="outline" size="sm" disabled={displayStatus !== 'Fechado'}>
                                        <Trophy className="mr-2 h-4 w-4" /> Lançar
                                    </Button>
                                </ResultFormModal>
                            )}
                            </TableCell>
                            <TableCell>
                                {displayStatus === 'Finalizado' && (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/boloes/${bolao.id}/ganhadores`}><Users className="mr-2 h-4 w-4" />Ver</Link>
                                    </Button>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <BolaoFormModal bolao={bolao} onSave={handleSave}>
                                    <Button variant="ghost" size="icon" disabled={displayStatus === 'Finalizado'}><Pencil className="h-4 w-4" /></Button>
                                </BolaoFormModal>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" disabled={displayStatus === 'Finalizado'}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(bolao.id)}>Deletar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    )
                })
              ) : (
                <TableRow><TableCell colSpan={8} className="text-center h-24">Nenhum bolão finalizado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
