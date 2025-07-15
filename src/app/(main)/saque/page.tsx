
"use client"

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

export default function WithdrawPage() {
  const { user, balance } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRequest = async () => {
    if (!user) {
      toast({ title: "Você precisa estar logado.", variant: "destructive" });
      return;
    }
    if (!amount || !pixKey) {
      toast({ title: "Preencha o valor e sua chave PIX.", variant: "destructive" });
      return;
    }
    if (balance === null || parseFloat(amount) > balance) {
        toast({ title: "Saldo insuficiente.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "withdrawals"), {
        userId: user.uid,
        amount: parseFloat(amount),
        pixKey,
        status: "pendente",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Solicitação Enviada!",
        description: "Sua solicitação de saque foi enviada e será processada em breve.",
        variant: "success",
      });

      setAmount("");
      setPixKey("");

    } catch (error) {
      console.error("Erro ao enviar solicitação de saque:", error);
      toast({ title: "Erro ao enviar solicitação.", variant: "destructive" });
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
            <Input
              id="amount"
              type="number"
              placeholder="Ex: 50,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pixKey">Sua Chave PIX</Label>
            <Input 
              id="pixKey" 
              type="text" 
              placeholder="E-mail, CPF/CNPJ, telefone ou chave aleatória"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmitRequest} disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isSubmitting ? "Enviando..." : "Enviar Solicitação de Saque"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
