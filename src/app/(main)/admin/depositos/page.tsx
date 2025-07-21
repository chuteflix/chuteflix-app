
"use client"

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db, functions } from '@/lib/firebase';
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
import { Transaction } from '@/services/transactions';
import Link from 'next/link';
import { format } from 'date-fns';
import { getAuth } from "firebase/auth"; // Para obter o token do usuário
// import { httpsCallable } from 'firebase/functions'; // Não é mais necessário aqui

type DepositRequest = Transaction & {
    user?: UserProfile;
}

export default function AdminDepositsPage() {
  const [pendingDeposits, setPendingDeposits] = useState<DepositRequest[]>([]);
  const [completedDeposits, setCompletedDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const { toast } = useToast();
  const auth = getAuth(); // Inicializa o Auth

  useEffect(() => {
    const baseQuery = query(collection(db, "transactions"), where("type", "==", "deposit"));
    const pendingQuery = query(baseQuery, where("status", "==", "pending"), orderBy("createdAt", "desc"));
    const completedQuery = query(baseQuery, where("status", "in", ["completed", "failed"]), orderBy("createdAt", "desc"));

    const fetchAndSetData = (q: any, setter: React.Dispatch<React.SetStateAction<DepositRequest[]>>) => {
        return onSnapshot(q, async (querySnapshot) => {
            setLoading(true);
            const data = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const transaction = doc.data() as DepositRequest;
                    const user = await getUserProfile(transaction.uid);
                    return { ...transaction, id: doc.id, user };
                })
            );
            setter(data);
            setLoading(false);
        });
    };

    const unsubscribePending = fetchAndSetData(pendingQuery, setPendingDeposits);
    const unsubscribeCompleted = fetchAndSetData(completedQuery, setCompletedDeposits);

    return () => {
        unsubscribePending();
        unsubscribeCompleted();
    };
  }, []);

  const handleApprove = async (id: string) => {
    setSubmitting(id);
    try {
        const user = auth.currentUser; 
        if (!user) {
            throw new Error("Usuário não autenticado.");
        }
        const idToken = await user.getIdToken(); 

        const response = await fetch('/api/deposits/approve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ transactionId: id }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Falha ao aprovar depósito.');
        }

        toast({ title: "Depósito aprovado com sucesso!", variant: "success" });
    } catch (error: any) {
        toast({ title: "Erro ao aprovar depósito.", description: error.message, variant: "destructive" });
    } finally {
        setSubmitting(null);
    }
  };
  
  const handleDecline = async (id: string) => {
    setSubmitting(id);
    try {
        const user = auth.currentUser; 
        if (!user) {
            throw new Error("Usuário não autenticado.");
        }
        const idToken = await user.getIdToken(); 

        // CHAMA A NOVA NEXT.JS API ROUTE PARA RECUSAR
        const response = await fetch('/api/deposits/decline', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ transactionId: id }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Falha ao recusar depósito.');
        }

        toast({ title: "Depósito recusado.", variant: "info" });
    } catch(error: any) {
        toast({ title: "Erro ao recusar depósito.", description: error.message, variant: "destructive" });
    } finally {
        setSubmitting(null);
    }
  }
  
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
      <h1 className="text-3xl font-bold">Gerenciamento de Depósitos</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Depósitos Pendentes</CardTitle>
          <CardDescription>Aprove ou recuse os depósitos com base nos comprovantes enviados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Comprovante</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : pendingDeposits.length > 0 ? (
                pendingDeposits.map((req) => (
                  <TableRow key={req.id}>
                     <TableCell>
                        {req.createdAt ? format(new Date(req.createdAt.seconds * 1000), "dd/MM/yyyy 'às' HH:mm") : 'N/A'}
                    </TableCell>
                    <TableCell>{req.user?.name || req.user?.email || req.uid}</TableCell>
                    <TableCell>{req.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    <TableCell>
                      {req.metadata?.receiptUrl ? (
                        <Button asChild variant="outline" size="sm">
                            <Link href={req.metadata.receiptUrl} target="_blank">
                                <Eye className="mr-2 h-4 w-4" /> Ver
                            </Link>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Não enviado</span>
                      )}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(req.id)} disabled={submitting === req.id}>
                        {submitting === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Aprovar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDecline(req.id)} disabled={submitting === req.id}>
                        <X className="mr-2 h-4 w-4" /> Recusar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhum depósito pendente.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Depósitos</CardTitle>
          <CardDescription>Visualize todos os depósitos já processados.</CardDescription>
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
                ) : completedDeposits.length > 0 ? (
                    completedDeposits.map((req) => (
                    <TableRow key={req.id}>
                        <TableCell>
                            {req.createdAt ? format(new Date(req.createdAt.seconds * 1000), "dd/MM/yyyy 'às' HH:mm") : 'N/A'}
                        </TableCell>
                        <TableCell>{req.user?.name || req.user?.email || req.uid}</TableCell>
                        <TableCell>{req.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
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
                    <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhum depósito no histórico.</TableCell></TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
