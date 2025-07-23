
"use client"

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from '@/lib/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { getUserProfile, UserProfile } from '@/services/users';
import { Palpite } from '@/services/palpites';
import { getBolaoById, Bolao } from '@/services/boloes';
import { format } from 'date-fns';

type PalpiteComDetalhesAdmin = Palpite & {
    user?: UserProfile;
    bolao?: Bolao;
}

export default function AdminChutesPage() {
  const [ongoingChutes, setOngoingChutes] = useState<PalpiteComDetalhesAdmin[]>([]);
  const [completedChutes, setCompletedChutes] = useState<PalpiteComDetalhesAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseQuery = collection(db, "chutes");
    const ongoingQuery = query(baseQuery, where("status", "in", ["Em Aberto", "Aprovado"]), orderBy("createdAt", "desc"));
    const completedQuery = query(baseQuery, where("status", "in", ["Ganho", "Perdido", "Anulado"]), orderBy("createdAt", "desc"));

    const fetchAndSetData = (q: any, setter: React.Dispatch<React.SetStateAction<PalpiteComDetalhesAdmin[]>>) => {
        return onSnapshot(q, async (querySnapshot) => {
            setLoading(true);
            const data = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const palpite = { id: doc.id, ...doc.data() } as Palpite;
                    const [user, bolao] = await Promise.all([
                        getUserProfile(palpite.userId),
                        getBolaoById(palpite.bolaoId),
                    ]);
                    return { ...palpite, user, bolao };
                })
            );
            setter(data);
            setLoading(false);
        });
    };

    const unsubscribeOngoing = fetchAndSetData(ongoingQuery, setOngoingChutes);
    const unsubscribeCompleted = fetchAndSetData(completedQuery, setCompletedChutes);

    return () => {
        unsubscribeOngoing();
        unsubscribeCompleted();
    };
  }, []);
  
  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Ganho': return 'bg-green-100 text-green-800';
        case 'Perdido': return 'bg-red-100 text-red-800';
        case 'Anulado': return 'bg-gray-100 text-gray-800';
        default: return 'bg-yellow-100 text-yellow-800';
    }
  }

  return (
    <div className="container mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Gerenciamento de Chutes</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Chutes em Andamento</CardTitle>
          <CardDescription>Palpites de bolões que ainda não foram finalizados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Palpite</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : ongoingChutes.length > 0 ? (
                ongoingChutes.map((chute) => (
                  <TableRow key={chute.id}>
                     <TableCell>{chute.createdAt ? format(new Date(chute.createdAt.seconds * 1000), "dd/MM/yyyy 'às' HH:mm") : 'N/A'}</TableCell>
                    <TableCell>{chute.user?.name || chute.user?.email}</TableCell>
                    <TableCell>{chute.bolao?.categoryNames?.join(', ')}</TableCell>
                    <TableCell className="font-medium">
                        {chute.bolao?.homeTeam?.name} {chute.scoreTeam1} x {chute.scoreTeam2} {chute.bolao?.awayTeam?.name}
                    </TableCell>
                    <TableCell>R$ {chute.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhum chute em andamento.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Chutes</CardTitle>
          <CardDescription>Visualize todos os palpites de bolões já finalizados.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Palpite</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                ) : completedChutes.length > 0 ? (
                    completedChutes.map((chute) => (
                    <TableRow key={chute.id}>
                        <TableCell>{chute.createdAt ? format(new Date(chute.createdAt.seconds * 1000), "dd/MM/yyyy 'às' HH:mm") : 'N/A'}</TableCell>
                        <TableCell>{chute.user?.name || chute.user?.email}</TableCell>
                        <TableCell>{chute.bolao?.categoryNames?.join(', ')}</TableCell>
                        <TableCell className="font-medium">
                            {chute.bolao?.homeTeam?.name} {chute.scoreTeam1} x {chute.scoreTeam2} {chute.bolao?.awayTeam?.name}
                        </TableCell>
                        <TableCell>R$ {chute.amount.toFixed(2)}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusVariant(chute.status)}`}>
                                {chute.status}
                            </span>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center">Nenhum chute no histórico.</TableCell></TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
