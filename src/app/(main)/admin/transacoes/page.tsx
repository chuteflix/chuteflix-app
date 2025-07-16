
"use client"

import { useEffect, useState } from "react"
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Transaction } from "@/services/transactions"
import { getUserProfile, UserProfile } from "@/services/users"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDownLeft, ArrowUpRight, Minus, CircleDollarSign, Send } from "lucide-react"
import { format } from 'date-fns';

type TransactionWithUser = Transaction & { user?: UserProfile };

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const transactionsPromises = snapshot.docs.map(async (doc): Promise<TransactionWithUser> => {
            const txData = { id: doc.id, ...doc.data() } as Transaction;
            const user = await getUserProfile(txData.uid);
            return { ...txData, user };
        });

        const transactionsWithUsers = await Promise.all(transactionsPromises);
        setTransactions(transactionsWithUsers);
        setLoading(false);
    }, (error) => {
        console.error("Erro ao buscar transações:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [])

  const getTransactionTypeDetails = (type: Transaction['type']) => {
    switch(type) {
      case 'deposit': return { label: 'Depósito', icon: <ArrowUpRight className="h-4 w-4 text-success" />, color: 'text-success' };
      case 'withdrawal': return { label: 'Saque', icon: <ArrowDownLeft className="h-4 w-4 text-destructive" />, color: 'text-destructive' };
      case 'bet_placement': return { label: 'Aposta', icon: <Send className="h-4 w-4 text-blue-500" />, color: 'text-blue-500' };
      case 'prize_winning': return { label: 'Prêmio', icon: <CircleDollarSign className="h-4 w-4 text-amber-500" />, color: 'text-amber-500' };
      default: return { label: type, icon: <Minus className="h-4 w-4 text-muted-foreground"/>, color: '' };
    }
  }
  
  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'completed': return 'success';
        case 'failed': return 'destructive';
        default: return 'secondary';
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Transações da Plataforma</h1>
      <Card>
        <CardHeader>
          <CardTitle>Histórico Geral de Transações</CardTitle>
          <CardDescription>Auditoria de todas as movimentações financeiras no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : transactions.length > 0 ? (
                transactions.map(tx => {
                  const typeDetails = getTransactionTypeDetails(tx.type);
                  return (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.createdAt ? format(new Date(tx.createdAt.seconds * 1000), "dd/MM/yyyy 'às' HH:mm") : 'N/A'}</TableCell>
                      <TableCell>{tx.user?.name || tx.user?.email || tx.uid}</TableCell>
                      <TableCell className="flex items-center gap-2">{typeDetails.icon} {typeDetails.label}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell><Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge></TableCell>
                      <TableCell className={`text-right font-bold ${typeDetails.color}`}>
                        {tx.type === 'bet_placement' ? `-${Math.abs(tx.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">Nenhuma transação encontrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
