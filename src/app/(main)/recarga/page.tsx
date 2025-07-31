
"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { createTransaction, updateTransaction, Transaction } from "@/services/transactions";
import { uploadFileToApi } from "@/services/upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, History, Eye } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { PaymentModal } from "@/components/payment-modal";
import { ProofOfPaymentModal } from "@/components/proof-of-payment-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Link from 'next/link';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function RechargePage() {
  const { user, settings, loading: loadingAuth } = useAuth(); // Obtenha settings do useAuth
  const { toast } = useToast();
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }
    
    setLoadingHistory(true);
    const q = query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
      where("type", "==", "deposit"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userDeposits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setDeposits(userDeposits);
      setLoadingHistory(false);
    }, (error) => {
      console.error("Erro no listener de depósitos:", error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível buscar suas recargas. Tente recarregar a página.",
        variant: "destructive",
      });
      setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleRequestRecharge = async () => {
    if (!user) {
      toast({ title: "Você precisa estar logado.", variant: "destructive" });
      return;
    }
    if (!amount) {
      toast({ title: "Preencha o valor da recarga.", variant: "destructive" });
      return;
    }
    // Use settings diretamente do contexto, mas garanta que ele esteja carregado
    if (loadingAuth || !settings) {
        toast({ title: "Aguarde, carregando informações de pagamento...", variant: "info" });
        return;
    }
    if (settings.minDeposit && amount < settings.minDeposit) {
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
    // Use settings diretamente do contexto, mas garanta que ele esteja carregado
    if (loadingAuth || !settings?.whatsappNumber || !amount || !currentTransactionId) {
      toast({ title: "Não foi possível gerar o link do WhatsApp (informações ausentes).", variant: "destructive" });
      return;
    }
    const message = `Olá! Acabei de fazer uma recarga de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.

Estou enviando o comprovante para agilizar a aprovação.

Meu ID de Transação é: ${currentTransactionId}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${settings.whatsappNumber.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    handleProofModalClose();
  };

  const handleFileSelect = async (file: File) => {
    if (!user || !currentTransactionId) {
      toast({ title: "Erro", description: "Usuário não autenticado ou transação não encontrada.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const receiptUrl = await uploadFileToApi(file);
      await updateTransaction(currentTransactionId, { metadata: { receiptUrl } });
      handleProofModalClose();
       toast({
        title: "Comprovante Enviado!",
        description: "Seu comprovante foi anexado e será analisado em breve.",
        variant: "success",
      })
    } catch (error) {
      console.error("Erro ao enviar comprovante:", error);
      toast({
        title: "Erro ao Enviar",
        description: "Não foi possível enviar o comprovante. Tente novamente ou use o WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'failed': return 'bg-red-100 text-red-800';
        default: return 'bg-yellow-100 text-yellow-800';
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
        case 'completed': return 'Concluído';
        case 'failed': return 'Recusado';
        default: return 'Pendente';
    }
  }

  return (
    <>
      <div className="container mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Recarregar Saldo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
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
                    <Button onClick={handleRequestRecharge} disabled={isSubmitting || loadingAuth || !settings} className="w-full h-12 text-lg">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    {isSubmitting ? "Processando..." : "Continuar para Pagamento"}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><History /> Histórico de Recargas</CardTitle>
                    <CardDescription>Acompanhe o status das suas 10 recargas mais recentes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Comprovante</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingHistory ? (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></TableCell></TableRow>
                            ) : deposits.length > 0 ? (
                                deposits.map(d => (
                                    <TableRow key={d.id}>
                                        <TableCell>{d.createdAt ? format(new Date(d.createdAt.seconds * 1000), "dd/MM/yyyy") : 'N/A'}</TableCell>
                                        <TableCell>{d.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusVariant(d.status)}`}>
                                                {getStatusLabel(d.status)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                        {d.metadata?.receiptUrl ? (
                                            <Button asChild variant="outline" size="icon">
                                                <Link href={d.metadata.receiptUrl} target="_blank">
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhuma recarga realizada.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>

      {isPaymentModalOpen && amount && (
          <PaymentModal 
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onPaymentConfirmed={handlePaymentConfirmed}
            amount={amount}
            settings={settings} // Passa settings para o modal
          />
      )}

      {isProofModalOpen && currentTransactionId && (
        <ProofOfPaymentModal
            isOpen={isProofModalOpen}
            onClose={handleProofModalClose}
            onFileSelect={handleFileSelect}
            onWhatsappRedirect={handleWhatsappRedirect}
            isUploading={isUploading}
            settings={settings} // Passa settings para o modal
        />
      )}
    </>
  );
}
