
"use client"

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
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
import { Check, X, Loader2 } from 'lucide-react';
import { getUserProfile, UserProfile } from '@/services/users';

interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  pixKey: string;
  status: 'pendente' | 'concluido' | 'recusado';
  createdAt: any;
  user?: UserProfile;
}

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "withdrawals"), where("status", "==", "pendente"));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);
      const requestsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data() as WithdrawalRequest;
          const user = await getUserProfile(data.userId);
          return { ...data, id: doc.id, user };
        })
      );
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleConfirm = async (req: WithdrawalRequest) => {
    setSubmitting(req.id);
    try {
      const confirmWithdrawal = httpsCallable(functions, 'confirmWithdrawal');
      await confirmWithdrawal({
        withdrawalId: req.id,
        userId: req.userId,
        amount: req.amount,
      });
      toast({ title: "Saque confirmado com sucesso!", variant: "success" });
    } catch (error: any) {
      toast({ title: "Erro ao confirmar saque.", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(null);
    }
  };
  
  const handleDecline = async (id: string) => {
    setSubmitting(id);
    try {
        const requestRef = doc(db, "withdrawals", id);
        await updateDoc(requestRef, { status: 'recusado' });
        toast({ title: "Solicitação recusada.", variant: "info" });
    } catch(error) {
        toast({ title: "Erro ao recusar solicitação.", variant: "destructive" });
    } finally {
        setSubmitting(null);
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Solicitações de Saque</h1>
      <Card>
        <CardHeader>
          <CardTitle>Saques Pendentes</CardTitle>
          <CardDescription>Processe os saques solicitados pelos usuários.</CardDescription>
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
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.user?.displayName || req.user?.email || req.userId}</TableCell>
                    <TableCell>{req.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    <TableCell>{req.pixKey}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => handleConfirm(req)} disabled={submitting === req.id}>
                        {submitting === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Concluído
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
    </div>
  );
}
