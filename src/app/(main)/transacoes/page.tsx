
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { getUserTransactions, Transaction } from "@/services/transactions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

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

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Math.abs(amount))
    return isNegative ? `- ${formatted}` : formatted
  }

  const getStatusVariant = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Minhas Transações
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            Veja aqui o registro de todas as suas movimentações na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map(tx => (
                  <TableRow key={tx.uid}>
                    <TableCell>
                      {format(tx.createdAt.toDate(), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell
                      className={
                        tx.amount < 0 ? "text-red-500" : "text-green-500"
                      }
                    >
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(tx.status)}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
