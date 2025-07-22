"use client";

import { useState } from "react";
import Countdown from "react-countdown";
import { isPast, isValid } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palpite } from "@/services/palpites";
import { Bolao } from "@/services/boloes";
import { Trophy, Users, GitCommitVertical, AlertCircle } from "lucide-react";
import { PalpiteModal } from "@/components/palpite-modal";
import { getParticipantCount } from "@/services/palpites";
import { useEffect } from "react";

interface PalpiteGroupCardProps {
  bolao: Bolao;
  palpites: Palpite[];
}

export function PalpiteGroupCard({ bolao, palpites }: PalpiteGroupCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [loadingParticipants, setLoadingParticipants] = useState(true);

  useEffect(() => {
    const fetchParticipantCount = async () => {
      setLoadingParticipants(true);
      try {
        const count = await getParticipantCount(bolao.id);
        setParticipantCount(count);
      } catch (error) {
        console.error("Erro ao buscar participantes:", error);
      } finally {
        setLoadingParticipants(false);
      }
    };
    fetchParticipantCount();
  }, [bolao.id]);

  if (!bolao) return null;

  // CORREÇÃO: Garantir que betAmount seja um número para o cálculo
  const betAmountNumber = Number(bolao.betAmount) || 0;
  const initialPrizeNumber = Number(bolao.initialPrize) || 0;
  const totalPrize = initialPrizeNumber + (participantCount * betAmountNumber * 0.9);
  
  const closingDateTime = bolao.closingTime;

  const isBettingClosed = !closingDateTime || !isValid(closingDateTime) || isPast(closingDateTime) || bolao.status === 'Fechado' || bolao.status === 'Finalizado';

  const countdownRenderer = ({ days, hours, minutes, seconds, completed }: any) => {
    if (completed || isBettingClosed) {
      return <span className="font-bold text-destructive">Chutes Encerrados</span>;
    }
    return (
      <div className="flex space-x-1 text-sm">
        <span>{String(days).padStart(2, '0')}d</span>
        <span>{String(hours).padStart(2, '0')}h</span>
        <span>{String(minutes).padStart(2, '0')}m</span>
        <span>{String(seconds).padStart(2, '0')}s</span>
      </div>
    );
  };
  
  const getStatusVariant = (status: string): "success" | "destructive" | "secondary" | "outline" | "default" | null | undefined=> {
    switch(status) {
        case "Ganho": return "success";
        case "Perdido": return "destructive";
        case "Anulado": return "secondary";
        default: return "outline";
    }
  }

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="text-base truncate">{`${bolao.homeTeam.name} vs ${bolao.awayTeam.name}`}</CardTitle>
          <CardDescription>{bolao.championship}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-primary" />
              <span>Prêmio: <span className="font-bold text-foreground">{totalPrize.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              <span>{loadingParticipants ? '...' : participantCount} participantes</span>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2"><GitCommitVertical className="h-4 w-4" />Seus Palpites</h4>
            {palpites.map(p => (
              <div key={p.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50">
                <span className="font-bold">{p.scoreTeam1} x {p.scoreTeam2}</span>
                <Badge variant={getStatusVariant(p.status)}>
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 pt-4 border-t">
          {bolao.status !== 'Finalizado' ? (
            <>
                <div className="text-xs text-muted-foreground">
                    <p>Encerra em:</p>
                    {closingDateTime && isValid(closingDateTime) ? <Countdown date={closingDateTime} renderer={countdownRenderer} /> : <span className="font-bold text-destructive">Data inválida</span>}
                </div>
                <Button size="sm" className="w-full" onClick={() => setIsModalOpen(true)} disabled={isBettingClosed}>
                    {isBettingClosed && <AlertCircle className="h-4 w-4 mr-2" />}
                    {isBettingClosed ? 'Chutes Encerrados' : 'Chutar Novamente'}
                </Button>
            </>
          ) : (
            <div className="w-full text-center">
                <p className="text-sm text-muted-foreground">Resultado Final</p>
                <p className="text-xl font-bold">{bolao.finalScoreTeam1} x {bolao.finalScoreTeam2}</p>
            </div>
          )}
        </CardFooter>
      </Card>
      <PalpiteModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // A atualização já acontece via onSnapshot, não precisa de callback
        }}
        bolao={bolao}
      />
    </>
  );
}
