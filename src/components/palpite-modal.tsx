"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Bolao } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { DollarSign, ArrowLeft } from "lucide-react";

interface PalpiteModalProps {
  bolao: Bolao;
  isOpen: boolean;
  onClose: () => void;
}

export function PalpiteModal({ bolao, isOpen, onClose }: PalpiteModalProps) {
  const { toast } = useToast();
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  const handleSubmit = () => {
    if (!scoreA || !scoreB || isNaN(Number(scoreA)) || isNaN(Number(scoreB))) {
      toast({
        variant: "destructive",
        title: "Erro no Palpite",
        description: "Por favor, insira um placar válido para ambos os times.",
      });
      return;
    }

    // Simulate transaction
    console.log(`Palpite: ${bolao.teamA.name} ${scoreA} x ${scoreB} ${bolao.teamB.name}`);
    
    toast({
      title: "Palpite Enviado com Sucesso!",
      description: `Sua aposta de R$ ${bolao.betAmount.toFixed(2)} foi registrada. Boa sorte!`,
    });
    
    onClose();
    setScoreA("");
    setScoreB("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-primary text-center text-2xl font-bold">Chutar Placar</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {bolao.teamA.name} vs {bolao.teamB.name}
            <br />
            <span className="text-sm">{bolao.championship}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-2">
              <Image src={bolao.teamA.logoUrl} alt={bolao.teamA.name} width={64} height={64} className="rounded-full bg-muted aspect-square object-cover" />
              <Label htmlFor="teamA-score" className="text-center font-semibold">{bolao.teamA.name}</Label>
              <Input
                id="teamA-score"
                type="number"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                className="w-24 text-center text-2xl font-bold h-14"
                min="0"
                placeholder="0"
              />
            </div>
            <span className="text-4xl font-light text-muted-foreground mx-4">X</span>
            <div className="flex flex-col items-center gap-2">
              <Image src={bolao.teamB.logoUrl} alt={bolao.teamB.name} width={64} height={64} className="rounded-full bg-muted aspect-square object-cover" />
              <Label htmlFor="teamB-score" className="text-center font-semibold">{bolao.teamB.name}</Label>
               <Input
                id="teamB-score"
                type="number"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                className="w-24 text-center text-2xl font-bold h-14"
                min="0"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-lg text-accent font-semibold pt-4 border-t border-border">
              <DollarSign className="h-5 w-5" />
              <span>Valor da Aposta: R$ {bolao.betAmount.toFixed(2)}</span>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
            Confirmar e Pagar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
