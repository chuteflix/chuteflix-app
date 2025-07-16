
"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useAuth } from "@/context/auth-context"
import { getPalpitesComDetalhes, PalpiteComDetalhes, getParticipantCount } from "@/services/palpites"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Ticket, History } from "lucide-react"
import { PalpiteGroupCard } from "@/components/palpite-group-card"

export default function MeusChutesPage() {
  const { user } = useAuth()
  const [palpites, setPalpites] = useState<PalpiteComDetalhes[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});

  const fetchPalpites = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getPalpitesComDetalhes(user.uid);
      setPalpites(data);

      const counts = await Promise.all(
        data.map(p => getParticipantCount(p.bolaoId))
      );
      const countsMap = data.reduce((acc, p, i) => {
        acc[p.bolaoId] = counts[i];
        return acc;
      }, {} as Record<string, number>);
      setParticipantCounts(countsMap);

    } catch (err) {
      setError("Não foi possível carregar seus chutes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPalpites();
  }, [fetchPalpites]);

  const groupedPalpites = useMemo(() => {
    const emAndamento = palpites.filter(p => p.bolaoDetails?.status !== 'Finalizado');
    const historico = palpites.filter(p => p.bolaoDetails?.status === 'Finalizado');
    
    const groupByBolao = (list: PalpiteComDetalhes[]) => 
      list.reduce((acc, p) => {
        if (p.bolaoDetails) {
          acc[p.bolaoId] = acc[p.bolaoId] || { bolao: p.bolaoDetails, palpites: [] };
          acc[p.bolaoId].palpites.push(p);
        }
        return acc;
      }, {} as Record<string, { bolao: PalpiteComDetalhes['bolaoDetails'], palpites: PalpiteComDetalhes[] }>);

    return {
      emAndamento: Object.values(groupByBolao(emAndamento)),
      historico,
    }
  }, [palpites]);

  if (loading) return <SkeletonLoader />;
  if (error) return <Alert variant="destructive"><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="container mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Meus Chutes</h1>
        <p className="text-muted-foreground">Acompanhe seus palpites em andamento e seu histórico.</p>
      </div>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Ticket />Em Andamento</h2>
        {groupedPalpites.emAndamento.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedPalpites.emAndamento.map(({ bolao, palpites }) => (
              <PalpiteGroupCard 
                key={bolao?.id} 
                bolao={bolao} 
                palpites={palpites} 
                participantCount={participantCounts[bolao!.id] || 0}
                onPalpiteSubmit={fetchPalpites}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">Você não tem nenhum chute em bolões abertos.</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><History />Histórico</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partida</TableHead>
                <TableHead>Seu Palpite</TableHead>
                <TableHead>Resultado Final</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Prêmio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedPalpites.historico.length > 0 ? (
                groupedPalpites.historico.map(p => {
                  const isWinner = p.status === 'Ganho';
                  const prize = 0; // TODO: Buscar o valor da transação de prêmio
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{p.bolaoDetails?.name}</TableCell>
                      <TableCell>{p.scoreTeam1} x {p.scoreTeam2}</TableCell>
                      <TableCell>{p.bolaoDetails?.finalScoreTeam1 ?? '-'} x {p.bolaoDetails?.finalScoreTeam2 ?? '-'}</TableCell>
                      <TableCell><Badge variant={isWinner ? 'success' : 'outline'}>{isWinner ? "Ganhador" : "Não foi dessa vez"}</Badge></TableCell>
                      <TableCell className="text-right font-bold text-success">{prize.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">Nenhum chute finalizado no seu histórico.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  )
}

const SkeletonLoader = () => (
    <div className="container mx-auto space-y-8">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <section>
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </section>
      <section>
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </section>
    </div>
)
