
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getBolaoById, Bolao } from "@/services/boloes"
import { getPalpitesByBolaoId, PalpiteComDetalhes } from "@/services/palpites"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface GanhadoresPageClientProps {
  id: string;
}

export function GanhadoresPageClient({ id }: GanhadoresPageClientProps) {
  const [bolao, setBolao] = useState<Bolao | null>(null)
  const [winners, setWinners] = useState<PalpiteComDetalhes[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGanhadores = async () => {
      if (!id) return
      setLoading(true)
      try {
        const bolaoData = await getBolaoById(id);
        if (!bolaoData || bolaoData.status !== 'Finalizado') {
          throw new Error("Bolão não encontrado ou não finalizado.");
        }
        setBolao(bolaoData);

        const palpites = await getPalpitesByBolaoId(id);
        
        const winnerPalpites = palpites.filter(
          p => p.status === "Ganho"
        );

        setWinners(winnerPalpites);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
      } finally {
        setLoading(false);
      }
    }
    fetchGanhadores();
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto p-4"><Alert variant="destructive"><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;
  }
  
  const totalPrize = (bolao?.initialPrize || 0) + (winners.length * (bolao?.betAmount || 0) * 0.9);
  const prizePerWinner = winners.length > 0 ? totalPrize / winners.length : 0;

  return (
    <div className="container mx-auto">
       <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/admin/boloes"><ArrowLeft className="mr-2 h-4 w-4" />Voltar para Bolões</Link>
        </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy /> Ganhadores do Bolão</CardTitle>
          <CardDescription>
            Relação de todos os usuários que acertaram o placar de {bolao?.finalScoreTeam1} x {bolao?.finalScoreTeam2} no bolão "{bolao?.homeTeam?.name} vs {bolao?.awayTeam?.name}".
          </CardDescription>
          <div className="pt-4">
            <p><strong>Prêmio Total:</strong> {totalPrize.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            <p><strong>Valor por Ganhador:</strong> {prizePerWinner.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Completo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Chave PIX</TableHead>
                <TableHead>Palpite</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.length > 0 ? (
                winners.map((palpite) => (
                  <TableRow key={palpite.id}>
                    <TableCell>{palpite.user?.displayName || `${palpite.user?.firstName} ${palpite.user?.lastName}`}</TableCell>
                    <TableCell>{palpite.user?.email}</TableCell>
                    <TableCell>{palpite.user?.pixKey || "Não cadastrada"}</TableCell>
                    <TableCell>{`${palpite.scoreTeam1} x ${palpite.scoreTeam2}`}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">Nenhum ganhador encontrado para este bolão.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
