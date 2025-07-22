"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, onSnapshot, DocumentData } from "firebase/firestore"
import { Transaction } from "@/services/transactions"
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
import { format } from "date-fns"


export default function TransactionsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };

    setLoading(true);
    const transactionsRef = collection(db, "transactions")
    const q = query(
      transactionsRef,
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userTransactions = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              uid: data.uid,
              type: data.type,
              amount: data.amount,
              description: data.description,
              status: data.status,
              createdAt: data.createdAt,
              metadata: data.metadata,
          } as Transaction;
      });
      setTransactions(userTransactions)
      setLoading(false)
    }, (error) => {
        console.error("Erro ao buscar transações:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user])

  const getTransactionTypeDetails = (type: Transaction['type']) => {
    switch(type) {
      case 'deposit': return { label: 'Depósito', icon: <ArrowUpRight className="h-4 w-4 text-success" />, color: 'text-success' };
      case 'withdrawal': return { label: 'Saque', icon: <ArrowDownLeft className="h-4 w-4 text-destructive" />, color: 'text-destructive' };
      case 'bet_placement': return { label: 'Aposta', icon: <Send className="h-4 w-4 text-blue-500" />, color: 'text-blue-500' };
      case 'prize_winning': return { label: 'Prêmio', icon: <CircleDollarSign className="h-4 w-4 text-amber-500" />, color: 'text-amber-500' };
      case 'bet_refund': return { label: 'Estorno', icon: <CircleDollarSign className="h-4 w-4 text-amber-500" />, color: 'text-amber-500' };
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

  const formatAmount = (tx: Transaction) => {
    const isCredit = tx.type === 'deposit' || tx.type === 'prize_winning' || tx.type === 'bet_refund';
    const formatted = Math.abs(tx.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if(tx.amount > 0) return `+${formatted}`;
    if(tx.amount < 0) return `-${Math.abs(tx.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    return formatted;
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Minhas Transações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>Veja aqui todas as suas movimentações financeiras na plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
                      <TableCell className="flex items-center gap-2">{typeDetails.icon} {typeDetails.label}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell><Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge></TableCell>
                      <TableCell className={`text-right font-bold ${typeDetails.color}`}>
                        {formatAmount(tx)}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">Nenhuma transação encontrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
