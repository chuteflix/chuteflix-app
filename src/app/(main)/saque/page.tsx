
"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { getSettings, Settings } from "@/services/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, AlertCircle } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function WithdrawPage() {
  const { user, balance, userProfile } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const settingsData = await getSettings();
        setSettings(settingsData);
      } catch (error) {
        toast({ title: "Erro ao carregar configurações.", variant: "destructive" });
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleSubmitRequest = async () => {
    if (!user || !userProfile) {
      toast({ title: "Você precisa estar logado.", variant: "destructive" });
      return;
    }
    if (!amount) {
      toast({ title: "Preencha o valor do saque.", variant: "destructive" });
      return;
    }
    if (!userProfile.pixKey) {
      toast({ title: "Cadastre sua chave PIX antes de sacar.", variant: "destructive" });
      return;
    }
    if (balance === null || amount > balance) {
        toast({ title: "Saldo insuficiente.", variant: "destructive" });
        return;
    }
    if (settings?.minWithdrawal && amount < settings.minWithdrawal) {
      toast({ title: `O valor mínimo para saque é de R$ ${settings.minWithdrawal.toFixed(2)}`, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestWithdrawal = httpsCallable(functions, 'requestWithdrawal');
      await requestWithdrawal({ amount, pixKey: userProfile.pixKey });

      toast({
        title: "Solicitação Enviada!",
        description: "Sua solicitação de saque foi enviada e será processada em breve.",
        variant: "success",
      });
      
      setAmount(undefined);

    } catch (error: any) {
      console.error("Erro ao enviar solicitação de saque:", error);
      toast({ title: "Erro ao enviar solicitação.", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Solicitar Saque</h1>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Dados do Saque</CardTitle>
          <CardDescription>
            O valor será transferido para a chave PIX informada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Saque (R$)</Label>
            <NumericFormat
              id="amount"
              customInput={Input}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              value={amount}
              onValueChange={(values) => setAmount(values.floatValue)}
            />
          </div>
          <div className="space-y-2">
            <Label>Sua Chave PIX</Label>
            {userProfile?.pixKey ? (
                <div className="p-3 rounded-md border bg-muted">
                    <p className="font-semibold">{userProfile.pixKey}</p>
                    <p className="text-xs text-muted-foreground">{userProfile.pixKeyType}</p>
                </div>
            ) : (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Você ainda não cadastrou uma chave PIX. <Link href="/settings" className="font-bold underline">Cadastrar agora</Link>.
                    </AlertDescription>
                </Alert>
            )}
            <p className="text-xs text-muted-foreground">
                Para alterar sua chave, vá para a página <Link href="/settings" className="underline">Chave PIX</Link>.
            </p>
          </div>
          <Button onClick={handleSubmitRequest} disabled={isSubmitting || isLoadingSettings || !userProfile?.pixKey} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isSubmitting ? "Enviando..." : "Enviar Solicitação de Saque"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
