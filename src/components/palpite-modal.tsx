"use client";

import { useState, useEffect } from "react";
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
import type { Bolao, Settings } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { DollarSign, ArrowLeft, Copy, Check, CircleDot } from "lucide-react";
import { settings } from "@/lib/data";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface PalpiteModalProps {
  bolao: Bolao;
  isOpen: boolean;
  onClose: () => void;
}

export function PalpiteModal({ bolao, isOpen, onClose }: PalpiteModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [step, setStep] = useState<"form" | "payment">("form");
  const [paymentSettings, setPaymentSettings] = useState<Settings>(settings);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPaymentSettings(settings);
  }, []);
  
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setScoreA(bolao.userGuess?.teamA?.toString() || "");
      setScoreB(bolao.userGuess?.teamB?.toString() || "");
    }
  }, [isOpen, bolao]);


  const handleConfirmGuess = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado para fazer um palpite." });
      return;
    }

    if (!scoreA || !scoreB || isNaN(Number(scoreA)) || isNaN(Number(scoreB))) {
      toast({ variant: "destructive", title: "Erro no Palpite", description: "Por favor, insira um placar válido." });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Salvar o palpite
      const guessRef = await addDoc(collection(db, "guesses"), {
        userId: user.uid,
        bolaoId: bolao.id,
        teamA_score: Number(scoreA),
        teamB_score: Number(scoreB),
        createdAt: serverTimestamp(),
      });

      // 2. Criar a transação
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        bolaoId: bolao.id,
        guessId: guessRef.id,
        amount: bolao.betAmount,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setStep("payment");

    } catch (error) {
      console.error("Erro ao salvar palpite:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar seu palpite. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(paymentSettings.pixKey);
    setCopied(true);
    toast({
        title: "Chave PIX Copiada!",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    toast({
      title: "Palpite Registrado!",
      description: "Aguardando confirmação do pagamento.",
    });
    onClose();
  }

  const renderFormStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-foreground text-center text-2xl font-bold">Chutar Placar</DialogTitle>
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
              className="w-24 text-center text-2xl font-bold h-14 bg-background border-border"
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
              className="w-24 text-center text-2xl font-bold h-14 bg-background border-border"
              min="0"
              placeholder="0"
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-lg text-primary font-semibold pt-4 border-t border-border">
            <DollarSign className="h-5 w-5" />
            <span>Valor da Aposta: R$ {bolao.betAmount.toFixed(2)}</span>
        </div>
      </div>
      <DialogFooter className="sm:justify-between">
        <Button variant="outline" type="button" onClick={onClose} className="border-border hover:bg-muted">
          Cancelar
        </Button>
        <Button onClick={handleConfirmGuess} className="bg-primary text-primary-foreground font-bold hover:bg-primary/90" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : (
            <>
              <CircleDot className="mr-2 h-5 w-5" />
              Confirmar e Pagar
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );

  const renderPaymentStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-foreground text-center text-2xl font-bold">Realizar Pagamento</DialogTitle>
        <DialogDescription className="text-center text-muted-foreground">
            Para confirmar sua aposta, realize o pagamento via PIX no valor de 
            <span className="font-bold text-foreground"> R$ {bolao.betAmount.toFixed(2)}</span>.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 text-center">
        <div className="flex justify-center">
            <Image 
                src={paymentSettings.qrCodeUrl}
                alt="QR Code para pagamento PIX" 
                width={200}
                height={200}
                className="rounded-lg border p-1 bg-white"
            />
        </div>
        <div className="space-y-2">
            <Label className="text-muted-foreground">Ou copie a chave PIX</Label>
            <div className="flex items-center justify-center gap-2">
                <Input readOnly value={paymentSettings.pixKey} className="text-center bg-muted text-foreground" />
                <Button variant="outline" size="icon" onClick={handleCopyToClipboard} className="border-border hover:bg-muted">
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
        </div>
        <div className="text-sm text-muted-foreground pt-4 border-t border-border">
            <p className="font-semibold text-foreground">Importante!</p>
            <p>Após o pagamento, envie o comprovante para o número: <span className="font-bold text-foreground">{paymentSettings.whatsappNumber}</span></p>
        </div>
      </div>
      <DialogFooter className="sm:justify-between">
        <Button variant="outline" onClick={() => setStep('form')} className="border-border hover:bg-muted">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={handleClose} className="bg-primary text-primary-foreground font-bold hover:bg-primary/90">
            Já Paguei!
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
        {step === "form" ? renderFormStep() : renderPaymentStep()}
      </DialogContent>
    </Dialog>
  );
}
