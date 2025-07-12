"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, DollarSign, Swords, Info, CircleDot } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { Bolao } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PalpiteModal } from "@/components/palpite-modal";

interface BolaoCardProps {
  bolao: Bolao;
  isAuthenticated: boolean;
}

export function BolaoCard({ bolao, isAuthenticated }: BolaoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isClosed = new Date() > bolao.matchStartDate || bolao.status !== 'Aberto';
  const matchDateTime = isClient ? format(bolao.matchStartDate, "eeee, dd/MM 'às' HH:mm'h'", { locale: ptBR }) : "";

  const handleButtonClick = () => {
    if (isAuthenticated) {
      setIsModalOpen(true);
    } else {
      router.push('/login');
    }
  };

  return (
    <>
      <Card className="w-full max-w-sm bg-card border overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1 flex flex-col">
        <CardHeader className="p-4 bg-card">
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-normal text-muted-foreground flex-1 pr-2">{bolao.championship}</CardTitle>
            {isClient && (
              <Badge variant={isClosed ? "destructive" : "success"} className="whitespace-rap">
                {isClosed ? 'Fechado' : 'Aberto'}
              </Badge>
            )}
          </div>
          <div className="flex justify-around items-center text-center pt-4">
            <div className="flex flex-col items-center gap-2 w-2/5">
              <Image
                src={bolao.teamA.logoUrl}
                alt={bolao.teamA.name}
                width={48}
                height={48}
                className="rounded-full aspect-square object-cover bg-muted"
                data-ai-hint="team logo"
              />
              <span className="font-semibold text-foreground text-sm truncate w-full">{bolao.teamA.name}</span>
            </div>
            <Swords className="h-6 w-6 text-primary" />
            <div className="flex flex-col items-center gap-2 w-2/5">
              <Image
                src={bolao.teamB.logoUrl}
                alt={bolao.teamB.name}
                width={48}
                height={48}
                className="rounded-full aspect-square object-cover bg-muted"
                data-ai-hint="team logo"
              />
              <span className="font-semibold text-foreground text-sm truncate w-full">{bolao.teamB.name}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3 flex-grow">
          <div className="flex items-center gap-2 text-sm text-muted-foreground capitalize">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{matchDateTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 text-primary" />
            <span>Aposta de R$ {bolao.betAmount.toFixed(2)}</span>
          </div>
          {bolao.userGuess && (
             <div className="flex items-center gap-2 text-sm text-accent font-bold p-2 bg-accent/10 rounded-md">
                <Info className="h-4 w-4 text-accent" />
                <span>Seu Palpite: {bolao.userGuess.teamA} x {bolao.userGuess.teamB}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 bg-muted/30">
          <Button 
            onClick={handleButtonClick}
            disabled={!isClient || isClosed || (isAuthenticated && !!bolao.userGuess)}
            className="w-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <CircleDot className="mr-2 h-5 w-5" />
            {isAuthenticated ? 'Chutar Placar' : 'Faça Login para Chutar'}
          </Button>
        </CardFooter>
      </Card>
      <PalpiteModal bolao={bolao} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
