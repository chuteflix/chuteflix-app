"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Loader2, Eye, Wallet } from 'lucide-react';
import { getUserProfile } from '@/services/users';
import { UserProfile } from '@/types';
import { Transaction, approveWithdrawal, declineTransaction } from '@/services/transactions';
import Link from 'next/link';
import { format } from 'date-fns';

type WithdrawalRequest = Transaction & {
    user?: UserProfile | null;
}

export default function AdminWithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const q = query(
            collection(db, "transactions"),
            where("type", "==", "withdrawal"),
            where("status", "==", "pending"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            setLoading(true);
            const withdrawalRequests = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const transaction = { id: doc.id, ...doc.data() } as Transaction;
                    const user = await getUserProfile(transaction.uid);
                    return { ...transaction, user };
                })
            );
            setWithdrawals(withdrawalRequests);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleApprove = async (transactionId: string) => {
        try {
            await approveWithdrawal(transactionId);
            toast({
                title: "Saque aprovado",
                description: "O saque foi aprovado com sucesso.",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao aprovar saque",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDecline = async (transactionId: string) => {
        try {
            await declineTransaction(transactionId);
            toast({
                title: "Saque recusado",
                description: "O saque foi recusado com sucesso.",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao recusar saque",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center">
                            <Wallet className="mr-2" />
                            Solicitações de Saque
                        </CardTitle>
                        <CardDescription>Aprove ou recuse as solicitações de saque pendentes.</CardDescription>
                    </div>
                    <Link href="/admin/transacoes">
                        <Button variant="outline">
                            <Eye className="mr-2 h-4 w-4" /> Ver Todas
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : withdrawals.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">Nenhuma solicitação de saque pendente.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {withdrawals.map((w) => (
                                <TableRow key={w.id}>
                                    <TableCell>{w.user?.name || 'Usuário não encontrado'}</TableCell>
                                    <TableCell>R$ {w.amount.toFixed(2)}</TableCell>
                                    <TableCell>{w.createdAt ? format(w.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="ghost" className="mr-2" onClick={() => handleApprove(w.id)}>
                                            <Check className="h-4 w-4 text-green-500" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleDecline(w.id)}>
                                            <X className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
