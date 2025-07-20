"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { getBolaoById, Bolao } from "@/services/boloes"
import { getPalpitesByBolaoId, PalpiteComDetalhes } from "@/services/palpites"
import { PalpiteModal } from "@/components/palpite-modal"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Countdown from "react-countdown"
import { ArrowLeft, Crown, TrendingUp, MessageSquare } from "lucide-react"
import { isPast, format } from "date-fns" // Adicionado format aqui

interface TopBettor {
    user: PalpiteComDetalhes['user'];
    count: number;
}

interface BolaoPageClientProps {
  id: string;
}

export function BolaoPageClient({ id }: BolaoPageClientProps) {
  const { user, loading: authLoading } = useAuth()
  
  const [bolao, setBolao] = useState<Bolao | null>(null)
  const [comments, setComments] = useState<PalpiteComDetalhes[]>([])
  const [participantCount, setParticipantCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchData = async () => {
    try {
      if (!id) throw new Error("ID do bolão não encontrado.")
      setLoading(true)

      const bolaoDoc = await getBolaoById(id)
      if (!bolaoDoc) throw new Error("Bolão não encontrado.")

      const fetchedComments = await getPalpitesByBolaoId(id);
      
      setBolao(bolaoDoc)
      setComments(fetchedComments)
      setParticipantCount(new Set(fetchedComments.map(c => c.userId)).size)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if(id) {
      fetchData()
    }
  }, [id])
  
  const topBettors = useMemo(() => {
    if (!comments.length) return [];
    
    const bettors = comments.reduce((acc, current) => {
        const userId = current.user?.uid;
        if (!userId) return acc;

        acc[userId] = acc[userId] || { user: current.user, count: 0 };
        acc[userId].count++;
        
        return acc;
    }, {} as Record<string, TopBettor>);
    
    return Object.values(bettors).sort((a, b) => b.count - a.count).slice(0, 3);
  }, [comments]);

  const closingDateTime = useMemo(() => {
    if (bolao?.matchStartDate && bolao.closingTime) {
        const date = new Date(bolao.matchStartDate);
        // Corrigido: formatar bolao.closingTime (que é um objeto Date) para string antes de usar split
        const formattedClosingTime = format(bolao.closingTime, 'HH:mm');
        const [hours, minutes] = formattedClosingTime.split(':');
        date.setHours(parseInt(hours), parseInt(minutes));
        return date;
    }
    return new Date(0); // Retorna uma data inválida se as condições não forem atendidas
  }, [bolao]);

  const isBettingClosed = useMemo(() => {
    if (!bolao) return true;
    return isPast(closingDateTime) || bolao.status === 'Fechado' || bolao.status === 'Finalizado';
  }, [closingDateTime, bolao]);
  
  const totalPrize = (bolao?.initialPrize || 0) + (participantCount * (bolao?.betAmount || 0) * 0.9);

  const countdownRenderer = ({ days, hours, minutes, seconds, completed }: any) => {
    if (completed || isBettingClosed) {
      return <span className="text-destructive font-bold text-lg">Chutes Encerrados</span>
    } else {
      return (
        <div className="flex space-x-2 text-center">
          <div><span className="text-2xl font-bold">{String(days).padStart(2, '0')}</span><span className="text-xs">DIAS</span></div>
          <div><span className="text-2xl font-bold">{String(hours).padStart(2, '0')}</span><span className="text-xs">HORAS</span></div>
          <div><span className="text-2xl font-bold">{String(minutes).padStart(2, '0')}</span><span className="text-xs">MIN</span></div>
          <div><span className="text-2xl font-bold">{String(seconds).padStart(2, '0')}</span><span className="text-xs">SEG</span></div>
        </div>
      )
    }
  }
  
  const getBettingLine = (palpite: PalpiteComDetalhes) => {
    let line = `${palpite.user?.firstName || palpite.user?.displayName || "Anônimo"} apostou ${palpite.scoreTeam1} x ${palpite.scoreTeam2}`;
    if (palpite.scoreTeam1 > palpite.scoreTeam2) {
        line += ` para o ${bolao?.homeTeam?.name}`;
    } else if (palpite.scoreTeam2 > palpite.scoreTeam1) {
        line += ` para o ${bolao?.awayTeam?.name}`;
    }
    return line;
  }

  if (loading || authLoading || !bolao) {
    return (
      <div className="container mx-auto p-4 space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="container mx-auto p-4"><Alert variant="destructive"><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>
  }
  
  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        <Button variant="outline" size="sm" asChild><Link href="/inicio"><ArrowLeft className="mr-2 h-4 w-4" />Voltar ao Início</Link></Button>
        <Card className="overflow-hidden shadow-lg">
            <CardHeader className="p-4 bg-muted/20">
              <div className="flex justify-between items-start">
                  <div>
                      <h1 className="text-2xl font-bold">{bolao.homeTeam.name} vs {bolao.awayTeam.name}</h1>
                      <p className="text-sm text-muted-foreground">{bolao.championship}</p>
                  </div>
                  <Badge variant={bolao.status === 'Aberto' ? 'success' : 'destructive'} className="text-sm">{bolao.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-center items-center my-4 space-x-4 md:space-x-8">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2"><AvatarImage src={bolao.homeTeam.logoUrl} /><AvatarFallback>{bolao.homeTeam.name.slice(0,2)}</AvatarFallback></Avatar>
                <span className="text-3xl md:text-4xl font-bold text-muted-foreground">VS</span>
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2"><AvatarImage src={bolao.awayTeam.logoUrl} /><AvatarFallback>{bolao.awayTeam.name.slice(0,2)}</AvatarFallback></Avatar>
              </div>
              <Separator className="my-4"/>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div><p className="text-sm text-muted-foreground">Encerra em</p><Countdown date={closingDateTime} renderer={countdownRenderer} /></div>
                  <div><p className="text-sm text-muted-foreground">Prêmio Estimado</p><p className="text-3xl font-bold text-primary">{totalPrize.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                  <div><p className="text-sm text-muted-foreground">Participantes</p><p className="text-3xl font-bold">{participantCount}</p></div>
              </div>
              <Separator className="my-4"/>
              <div className="text-center"><Button size="lg" className="font-bold text-lg" onClick={() => setIsModalOpen(true)} disabled={isBettingClosed}>{isBettingClosed ? "Apostas Encerradas" : `Chutar Placar por ${bolao.betAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</Button></div>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp />Top Chutadores</CardTitle><CardDescription>Quem mais está confiante neste bolão.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {topBettors.length > 0 ? topBettors.map((bettor, index) => (
                    <div key={bettor.user?.uid} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-muted-foreground w-6">{index + 1}.</span>
                        <Avatar className="h-10 w-10 border-2"><AvatarImage src={bettor.user?.photoURL || ''} /><AvatarFallback>{bettor.user?.firstName?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-semibold">{bettor.user?.firstName || bettor.user?.displayName || 'Anônimo'}</p>
                          <p className="text-xs text-muted-foreground">{bettor.count} {bettor.count > 1 ? 'chutes' : 'chute'}</p>
                        </div>
                      </div>
                      {index === 0 && <Crown className="h-6 w-6 text-yellow-400" />}
                    </div>
                )) : <p className="text-center text-muted-foreground py-6">Ninguém se arriscou ainda. Que tal ser o primeiro?</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare />Últimos Chutes</CardTitle><CardDescription>Veja os palpites mais recentes da galera.</CardDescription></CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {comments.length > 0 ? comments.map(p => (
                    <div key={p.id} className="flex items-start gap-3 text-sm">
                      <Avatar className="h-9 w-9 border-2"><AvatarImage src={p.user?.photoURL || ''} /><AvatarFallback>{p.user?.firstName?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                      <div>
                          <p dangerouslySetInnerHTML={{ __html: getBettingLine(p) }} />
                          {p.comment && <p className="text-muted-foreground bg-muted/50 p-2 rounded-md mt-1">"{p.comment}"</p>}
                      </div>
                    </div>
                )) : <p className="text-center text-muted-foreground py-6">Ainda não há chutes. Seja o primeiro a apostar!</p>}
              </CardContent>
            </Card>
        </div>
      </div>
      {bolao && <PalpiteModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchData(); }} bolao={bolao}/>}
    </>
  )
}
