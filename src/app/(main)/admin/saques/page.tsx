
"use client"

import React, { useState, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X, Loader2, Eye } from 'lucide-react';
import { getUserProfile, UserProfile } from '@/services/users';
import { Transaction, approveWithdrawal, declineTransaction } from '@/services/transactions';
import Link from 'next/link';
import { format } from 'date-fns';

type WithdrawalRequest = Transaction & {
    user?: UserProfile;
}

export default function AdminWithdrawalsPage() {
  const [pendingRequests, setPendingRequests] = useState<WithdrawalRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const baseQuery = collection(db, "transactions");
    const pendingQuery = query(
        baseQuery, 
        where("type", "==", "withdrawal"),
        where("status", "==", "pending"),
        orderBy("createdAt", "desc")
    );
    const completedQuery = query(
        baseQuery, 
        where("type", "==", "withdrawal"),
        where("status", "in", ["completed", "failed"]),
        orderBy("createdAt", "desc")
    );

    const fetchAndSetRequests = (q: any, setter: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>) => {
        return onSnapshot(q, async (querySnapshot) => {
            setLoading(true);
            const requestsData = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const data = doc.data() as WithdrawalRequest;
                    const user = await getUserProfile(data.uid);
                    return { ...data, id: doc.id, user };
                })
            );
            setter(requestsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching requests:", error);
            toast({
                title: "Error fetching requests",
                description: "Could not fetch requests. Please try again later.",
                variant: "destructive"
            });
            setLoading(false);
        });
    };

    const unsubscribePending = fetchAndSetRequests(pendingQuery, setPendingRequests);
    const unsubscribeCompleted = fetchAndSetRequests(completedQuery, setCompletedRequests);

    return () => {
        unsubscribePending();
        unsubscribeCompleted();
    };
  }, []);
  
  const handleConfirm = async (transactionId: string) => {
      setSubmitting(transactionId);
      try {
          await approveWithdrawal(transactionId);
          toast({ title: "Saque confirmado com sucesso!", variant: "success" });
      } catch (error: any) {
          toast({ title: "Erro ao confirmar saque.", description: error.message, variant: "destructive" });
      } finally {
          setSubmitting(null);
      }
  }

  const handleDecline = async (id: string) => {
    setSubmitting(id);
    try {
        await declineTransaction(id);
        toast({ title: "Solicitação recusada e saldo estornado.", variant: "info" });
    } catch(error: any) {
        toast({ title: "Erro ao recusar solicitação.", description: error.message, variant: "destructive" });
    } finally {
        setSubmitting(null);
    }
  }
  
  const getStatusLabel = (status: string) => {
    switch (status) {
        case 'completed': return 'Concluído';
        case 'failed': return 'Recusado';
        default: return 'Pendente';
    }
  }
  
  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'failed': return 'bg-red-100 text-red-800';
        default: return 'bg-yellow-100 text-yellow-800';
    }
  }

  return (
    <div className="container mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Gerenciamento de Saques</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Saques Pendentes</CardTitle>
          <CardDescription>Aprove ou recuse os saques solicitados pelos usuários.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Chave PIX</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : pendingRequests.length > 0 ? (
                pendingRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.user?.name || req.user?.email || req.uid}</TableCell>
                    <TableCell>{Math.abs(req.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    <TableCell>{req.metadata?.pixKey}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => handleConfirm(req.id)} disabled={submitting === req.id}>
                        {submitting === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Concluir
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDecline(req.id)} disabled={submitting === req.id}>
                        <X className="mr-2 h-4 w-4" /> Recusar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhuma solicitação pendente.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Saques</CardTitle>
          <CardDescription>Visualize todos os saques processados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comprovante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                ) : completedRequests.length > 0 ? (
                    completedRequests.map((req) => (
                    <TableRow key={req.id}>
                        <TableCell>{req.createdAt ? format(new Date(req.createdAt.seconds * 1000), "dd/MM/yyyy 'às' HH:mm") : 'N/A'}</TableCell>
                        <TableCell>{req.user?.name || req.user?.email || req.uid}</TableCell>
                        <TableCell>{Math.abs(req.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusVariant(req.status)}`}>
                                {getStatusLabel(req.status)}
                            </span>
                        </TableCell>
                        <TableCell>
                        {req.metadata?.receiptUrl ? (
                            <Button asChild variant="outline" size="sm">
                                <Link href={req.metadata.receiptUrl} target="_blank">
                                    <Eye className="mr-2 h-4 w-4" /> Ver
                                </Link>
                            </Button>
                        ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                        )}
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhum saque no histórico.</TableCell></TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
