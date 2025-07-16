
"use client"

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from "firebase/firestore";
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
import { Check, X, Loader2, Paperclip, Eye } from 'lucide-react';
import { getUserProfile, UserProfile } from '@/services/users';
import { Transaction } from '@/services/transactions';
import { WithdrawalProofModal } from '@/components/withdrawal-proof-modal';
import Link from 'next/link';

type WithdrawalRequest = Transaction & {
    user?: UserProfile;
}

export default function AdminWithdrawalsPage() {
  const [pendingRequests, setPendingRequests] = useState<WithdrawalRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);

  useEffect(() => {
    const pendingQuery = query(
        collection(db, "transactions"), 
        where("type", "==", "withdrawal"),
        where("status", "==", "pending")
    );
    const completedQuery = query(
        collection(db, "transactions"), 
        where("type", "==", "withdrawal"),
        where("status", "in", ["completed", "failed"])
    );

    const fetchAndSetRequests = (query: any, setter: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>) => {
        return onSnapshot(query, async (querySnapshot) => {
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
        });
    };

    const unsubscribePending = fetchAndSetRequests(pendingQuery, setPendingRequests);
    const unsubscribeCompleted = fetchAndSetRequests(completedQuery, setCompletedRequests);

    return () => {
        unsubscribePending();
        unsubscribeCompleted();
    };
  }, []);

  const handleDecline = async (id: string) => {
    setSubmitting(id);
    try {
        const declineTransaction = httpsCallable(functions, 'declineTransaction');
        await declineTransaction({ transactionId: id });
        toast({ title: "Solicitação recusada.", variant: "info" });
    } catch(error: any) {
        toast({ title: "Erro ao recusar solicitação.", description: error.message, variant: "destructive" });
    } finally {
        setSubmitting(null);
    }
  }

  const handleOpenModal = (req: WithdrawalRequest) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  }

  return (
    <div className="container mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Gerenciamento de Saques</h1>
      
      {/* Tabela de Saques Pendentes */}
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
                      <Button size="sm" onClick={() => handleOpenModal(req)} disabled={submitting === req.id}>
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

      {/* Tabela de Histórico de Saques */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Saques</CardTitle>
          <CardDescription>Visualize todos os saques processados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comprovante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                ) : completedRequests.length > 0 ? (
                    completedRequests.map((req) => (
                    <TableRow key={req.id}>
                        <TableCell>{req.user?.name || req.user?.email || req.uid}</TableCell>
                        <TableCell>{Math.abs(req.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${req.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {req.status === 'completed' ? 'Concluído' : 'Recusado'}
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
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum saque no histórico.</TableCell></TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {isModalOpen && selectedRequest && (
        <WithdrawalProofModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            transactionId={selectedRequest.id}
            userId={selectedRequest.uid}
        />
      )}
    </div>
  );
}
