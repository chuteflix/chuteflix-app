
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { getUserTransactions, Transaction } from "@/services/transactions"
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
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

export default function TransactionsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        setLoading(true)
        const userTransactions = await getUserTransactions(user.uid)
        setTransactions(userTransactions)
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [user])

  const getTransactionTypeDetails = (type: Transaction['type']) => {
    switch(type) {
      case 'bet_placement': return { label: 'Aposta', icon: <ArrowDownLeft className="h-4 w-4 text-destructive" />, color: 'text-destructive' };
      case 'prize_winning': return { label: 'Prêmio', icon: <ArrowUpRight className="h-4 w-4 text-success" />, color: 'text-success' };
      default: return { label: type, icon: null, color: '' };
    }
  }

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
                      <TableCell>{tx.createdAt.toDate().toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="flex items-center gap-2">{typeDetails.icon} {typeDetails.label}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell><Badge variant={tx.status === 'completed' ? 'success' : 'secondary'}>{tx.status}</Badge></TableCell>
                      <TableCell className={`text-right font-bold ${typeDetails.color}`}>
                        {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
