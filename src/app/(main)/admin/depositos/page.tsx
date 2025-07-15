
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
import { Eye, Check, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getUserProfile, UserProfile } from '@/services/users';
import { Transaction } from '@/services/transactions';

type DepositRequest = Transaction & {
  user?: UserProfile;
}

export default function AdminDepositsPage() {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(
      collection(db, "transactions"), 
      where("type", "==", "deposit"),
      where("status", "==", "pending")
    );
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setLoading(true);
      const requestsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data() as DepositRequest;
          const user = await getUserProfile(data.uid);
          return { ...data, id: doc.id, user };
        })
      );
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (req: DepositRequest) => {
    setSubmitting(req.id);
    try {
      const approveDeposit = httpsCallable(functions, 'approveDeposit');
      await approveDeposit({
        transactionId: req.id,
        userId: req.uid,
      });
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
        const requestRef = doc(db, "transactions", id);
        await updateDoc(requestRef, { status: 'failed' });
        toast({ title: "Solicitação recusada.", variant: "info" });
    } catch(error) {
        toast({ title: "Erro ao recusar solicitação.", variant: "destructive" });
    } finally {
        setSubmitting(null);
    }
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Solicitações de Depósito</h1>
      <Card>
        <CardHeader>
          <CardTitle>Depósitos Pendentes</CardTitle>
          <CardDescription>Aprove ou recuse as solicitações de recarga dos usuários.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Comprovante</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.user?.name || req.user?.email || req.uid}</TableCell>
                    <TableCell>{req.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" /> Ver</Button>
                        </DialogTrigger>
                        <DialogContent><DialogHeader><DialogTitle>Comprovante</DialogTitle></DialogHeader><img src={req.metadata?.receiptUrl} alt="Comprovante" /></DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(req)} disabled={submitting === req.id}>
                        {submitting === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Aprovar
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
