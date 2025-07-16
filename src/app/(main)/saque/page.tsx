
"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { requestWithdrawal } from '@/services/transactions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, History, Eye } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import { Transaction } from '@/services/transactions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Link from 'next/link';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'; // 1. Importar limit
import { db } from '@/lib/firebase';

export default function WithdrawPage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [pixKey, setPixKey] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (userProfile?.pixKey) {
      setPixKey(userProfile.pixKey);
    }
  }, [userProfile]);

  useEffect(() => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    setLoadingHistory(true);
    const q = query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
      where("type", "==", "withdrawal"),
      orderBy("createdAt", "desc"),
      limit(10) // 2. Limitar a 10 registros
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userWithdrawals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setWithdrawals(userWithdrawals);
      setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleRequestWithdrawal = async () => {
    if (!user || !userProfile) {
      toast({ title: "Você precisa estar logado.", variant: "destructive" });
      return;
    }
    if (!amount) {
      toast({ title: "Preencha o valor do saque.", variant: "destructive" });
      return;
    }
    if ((userProfile.balance || 0) < amount) {
        toast({ title: "Saldo insuficiente.", variant: "destructive" });
        return;
    }
    if (!pixKey) {
        toast({ title: "Chave PIX não cadastrada.", description: "Cadastre sua chave PIX no menu 'Chave PIX' antes de sacar.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      await requestWithdrawal({ amount, pixKey });
      toast({ title: "Solicitação de saque enviada com sucesso!", description: "Sua solicitação será processada em breve.", variant: "success" });
      setAmount(undefined);
    } catch (error: any) {
      toast({ title: "Erro ao solicitar saque.", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
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
    <div className="container mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Solicitar Saque</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Passo 1: Informe o Valor</CardTitle>
                <CardDescription>
                Digite o valor que você deseja sacar do seu saldo.
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
                    placeholder="R$ 0,00"
                    className="h-12 text-lg"
                />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pixKey">Chave PIX</Label>
                    <Input id="pixKey" value={pixKey} disabled className="h-12 text-lg"/>
                    <p className="text-xs text-muted-foreground">
                        Para alterar sua chave, vá para a aba <Link href="/settings" className="underline">Chave PIX</Link>.
                    </p>
                </div>
                <Button onClick={handleRequestWithdrawal} disabled={isSubmitting} className="w-full h-12 text-lg">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                {isSubmitting ? "Processando..." : "Solicitar Saque"}
                </Button>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History /> Histórico de Saques</CardTitle>
                <CardDescription>Acompanhe o status dos seus 10 saques mais recentes.</CardDescription>
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
                        ) : withdrawals.length > 0 ? (
                            withdrawals.map(w => (
                                <TableRow key={w.id}>
                                    <TableCell>{w.createdAt ? format(new Date(w.createdAt.seconds * 1000), "dd/MM/yyyy") : 'N/A'}</TableCell>
                                    <TableCell>{Math.abs(w.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusVariant(w.status)}`}>
                                            {getStatusLabel(w.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                      {w.metadata?.receiptUrl ? (
                                        <Button asChild variant="outline" size="icon">
                                            <Link href={w.metadata.receiptUrl} target="_blank">
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
                            <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum saque realizado.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
