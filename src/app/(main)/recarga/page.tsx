
"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { getSettings, Settings } from "@/services/settings";
import { createTransaction } from "@/services/transactions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { PaymentModal } from "@/components/payment-modal";
import { ProofOfPaymentModal } from "@/components/proof-of-payment-modal";

export default function RechargePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const settingsData = await getSettings();
        setSettings(settingsData);
      } catch (error) {
        toast({ title: "Erro ao carregar dados de pagamento.", variant: "destructive" });
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleRequestRecharge = async () => {
    if (!user) {
      toast({ title: "Você precisa estar logado.", variant: "destructive" });
      return;
    }
    if (!amount) {
      toast({ title: "Preencha o valor da recarga.", variant: "destructive" });
      return;
    }
    if (settings?.minDeposit && amount < settings.minDeposit) {
      toast({ title: `O valor mínimo para depósito é de ${settings.minDeposit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionId = await createTransaction({
        uid: user.uid,
        type: "deposit",
        amount: amount,
        description: "Depósito via PIX",
        status: "pending",
        metadata: { receiptUrl: "" },
      });

      setCurrentTransactionId(transactionId);
      setIsPaymentModalOpen(true);

    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      toast({ title: "Erro ao criar solicitação de recarga.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentConfirmed = () => {
    setIsPaymentModalOpen(false);
    setIsProofModalOpen(true);
  };
  
  const handleProofModalClose = () => {
    setIsProofModalOpen(false);
    toast({
        title: "Solicitação em análise",
        description: "Sua recarga está sendo processada. O saldo será atualizado em breve.",
        variant: "success"
    })
    setAmount(undefined);
    setCurrentTransactionId(null);
  };

  const handleWhatsappRedirect = () => {
    if (!settings?.whatsappNumber || !amount || !currentTransactionId) {
      toast({ title: "Não foi possível gerar o link do WhatsApp.", variant: "destructive" });
      return;
    }
    const message = `Olá! Acabei de fazer uma recarga de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.

Estou enviando o comprovante para agilizar a aprovação.

Meu ID de Transação é: ${currentTransactionId}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${settings.whatsappNumber.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    handleProofModalClose();
  };

  return (
    <>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Recarregar Saldo</h1>
        
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Passo 1: Informe o Valor</CardTitle>
                <CardDescription>
                Digite o valor que você deseja adicionar ao seu saldo.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="amount">Valor da Recarga (R$)</Label>
                <NumericFormat
                    id="amount"
                    customInput={Input}
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    value={amount}
                    onValueChange={(values) => setAmount(values.floatValue)}
                    placeholder="R$ 0,00"
                    className="h-12 text-lg"
                />
                </div>
                <Button onClick={handleRequestRecharge} disabled={isSubmitting || isLoadingSettings} className="w-full h-12 text-lg">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                {isSubmitting ? "Processando..." : "Continuar para Pagamento"}
                </Button>
            </CardContent>
        </Card>
      </div>

      {isPaymentModalOpen && amount && (
          <PaymentModal 
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onPaymentConfirmed={handlePaymentConfirmed}
            amount={amount}
          />
      )}

      {isProofModalOpen && currentTransactionId && (
        <ProofOfPaymentModal
            isOpen={isProofModalOpen}
            onClose={handleProofModalClose}
            onWhatsappRedirect={handleWhatsappRedirect}
            transactionId={currentTransactionId}
        />
      )}
    </>
  );
}
