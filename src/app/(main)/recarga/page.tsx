
"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { getSettings, Settings } from "@/services/settings";
import { createTransaction } from "@/services/transactions";
import { uploadFile } from "@/services/storage";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";

export default function RechargePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [amount, setAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmitRequest = async () => {
    if (!user) {
      toast({ title: "Você precisa estar logado.", variant: "destructive" });
      return;
    }
    if (!receiptFile || !amount) {
      toast({ title: "Preencha o valor e anexe o comprovante.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const receiptUrl = await uploadFile(receiptFile, `receipts/deposits/${user.uid}/${Date.now()}_${receiptFile.name}`);

      await createTransaction({
        uid: user.uid,
        type: "deposit",
        amount: parseFloat(amount),
        description: "Depósito via PIX",
        status: "pending",
        metadata: { receiptUrl },
      });

      toast({
        title: "Solicitação Enviada!",
        description: "Sua solicitação de recarga foi enviada e será revisada em breve.",
        variant: "success",
      });

      setAmount("");
      setReceiptFile(null);

    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      toast({ title: "Erro ao enviar solicitação.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Recarregar Saldo</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Passo 1: Realize o Pagamento</CardTitle>
            <CardDescription>
              Faça um PIX para a chave abaixo com o valor desejado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSettings ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : settings ? (
              <div className="flex flex-col items-center gap-4">
                {settings.qrCodeUrl && (
                  <Image src={settings.qrCodeUrl} alt="QR Code para pagamento" width={200} height={200} />
                )}
                <div className="text-center">
                  <p className="font-semibold text-lg">Chave PIX (CNPJ)</p>
                  <p className="text-muted-foreground">{settings.pixKey}</p>
                </div>
              </div>
            ) : (
              <p>Não foi possível carregar as informações de pagamento.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passo 2: Confirme sua Recarga</CardTitle>
            <CardDescription>
              Preencha o valor e anexe o comprovante para validarmos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor da Recarga (R$)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Ex: 50,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt">Comprovante de Pagamento</Label>
              <Input id="receipt" type="file" onChange={handleFileChange} />
            </div>
            <Button onClick={handleSubmitRequest} disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
