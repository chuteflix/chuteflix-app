
import { useState } from "react";
import Countdown from "react-countdown";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PalpiteComDetalhes } from "@/services/palpites";
import { Trophy, Users, GitCommitVertical } from "lucide-react";
import { PalpiteModal } from "@/components/palpite-modal";

interface PalpiteGroupCardProps {
  bolao: PalpiteComDetalhes['bolaoDetails'];
  palpites: PalpiteComDetalhes[];
  participantCount: number;
  onPalpiteSubmit: () => void;
}

export function PalpiteGroupCard({ bolao, palpites, participantCount, onPalpiteSubmit }: PalpiteGroupCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  if (!bolao) return null;

  const totalPrize = (bolao.initialPrize || 0) + (participantCount * bolao.fee * 0.9);
  const closingDateTime = new Date(`${bolao.matchDate}T${bolao.closingTime}`);

  const countdownRenderer = ({ days, hours, minutes, seconds, completed }: any) => {
    if (completed) {
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

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-base">{bolao.name}</CardTitle>
          <CardDescription>{bolao.championshipDetails?.name}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-primary" />
              <span>Prêmio: <span className="font-bold text-foreground">{totalPrize.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              <span>{participantCount} participantes</span>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2"><GitCommitVertical className="h-4 w-4" />Seus Palpites</h4>
            {palpites.map(p => (
              <div key={p.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50">
                <span className="font-bold">{p.scoreTeam1} x {p.scoreTeam2}</span>
                <Badge variant={p.status === 'Em Aberto' ? 'secondary' : 'default'}>
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 pt-4 border-t">
            <div className="text-xs text-muted-foreground">
                <p>Encerra em:</p>
                <Countdown date={closingDateTime} renderer={countdownRenderer} />
            </div>
            <Button size="sm" className="w-full" onClick={() => setIsModalOpen(true)}>
                Chutar Novamente
            </Button>
        </CardFooter>
      </Card>
      <PalpiteModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          onPalpiteSubmit();
        }}
        bolao={bolao}
      />
    </>
  );
}
