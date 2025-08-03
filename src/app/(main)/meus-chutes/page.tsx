"use client"

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { Palpite } from "@/services/palpites";
import { PalpiteGroupCard } from "@/components/palpite-group-card";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getBolaoById } from "@/services/boloes"; 
import { getTeamById } from "@/services/teams"; // Removed Team import
import { getChampionshipById, Championship } from "@/services/championships";
import { Separator } from "@/components/ui/separator";
import { Bolao, Team } from "@/types"; // Imported Bolao and Team from @/types

// Estrutura para agrupar palpites por bolão
interface PalpitesAgrupados {
  bolao: Bolao & {
    teamADetails?: Team;
    teamBDetails?: Team;
    championshipDetails?: Championship;
  };
  palpitesDoUsuario: Palpite[];
}

export default function MeusChutesPage() {
  const { user } = useAuth();
  const [groupedPalpites, setGroupedPalpites] = useState<PalpitesAgrupados[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "chutes"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const palpitesDoUsuario = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Palpite));

      // Agrupar palpites por bolaoId
      const palpitesPorBolao = palpitesDoUsuario.reduce((acc, p) => {
        (acc[p.bolaoId] = acc[p.bolaoId] || []).push(p);
        return acc;
      }, {} as Record<string, Palpite[]>);

      // Buscar detalhes para cada grupo
      const promises = Object.keys(palpitesPorBolao).map(async (bolaoId): Promise<PalpitesAgrupados | null> => {
        const bolaoDetails = await getBolaoById(bolaoId);
        if (!bolaoDetails) return null;

        // Os detalhes dos times e campeonato já são carregados dentro de getBolaoById
        return {
          bolao: bolaoDetails,
          palpitesDoUsuario: palpitesPorBolao[bolaoId],
        };
      });

      const finalGroupedData = (await Promise.all(promises)).filter(g => g !== null) as PalpitesAgrupados[];
      
      // Ordenar os grupos de bolões pela data do palpite mais recente em cada um
      finalGroupedData.sort((a, b) => {
        // @ts-ignore
        const lastA = a.palpitesDoUsuario[0]?.createdAt?.toMillis() || 0;
        // @ts-ignore
        const lastB = b.palpitesDoUsuario[0]?.createdAt?.toMillis() || 0;
        return lastB - lastA;
      });

      setGroupedPalpites(finalGroupedData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar palpites em tempo real: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const { ongoingGroups, completedGroups } = useMemo(() => {
    // CORREÇÃO: Status 'Aberto' e 'Fechado' indicam que o bolão ainda está "em jogo" (não finalizado).
    const ongoing = groupedPalpites.filter(g => g.bolao.status === 'Aberto' || g.bolao.status === 'Fechado');
    // CORREÇÃO: Apenas 'Finalizado' vai para o histórico.
    const completed = groupedPalpites.filter(g => g.bolao.status === 'Finalizado');
    return { ongoingGroups: ongoing, completedGroups: completed };
  }, [groupedPalpites]);

  if (loading) {
    return (
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Meus Chutes</h1>
        <div className="space-y-12">
            <div>
                <Skeleton className="h-8 w-1/4 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => ( <Skeleton key={i} className="h-48 w-full rounded-lg" /> ))}
                </div>
            </div>
             <Separator />
            <div>
                <Skeleton className="h-8 w-1/4 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 2 }).map((_, i) => ( <Skeleton key={i} className="h-48 w-full rounded-lg" /> ))}
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-12">
       <h1 className="text-3xl font-bold">Meus Chutes</h1>
      {groupedPalpites.length === 0 ? (
         <div className="text-center bg-muted/20 border-2 border-dashed border-border/30 rounded-lg py-20 col-span-full">
            <h3 className="text-2xl font-bold">Você ainda não fez nenhum chute.</h3>
            <p className="text-muted-foreground mt-2">Explore os bolões disponíveis e dê o seu palpite!</p>
        </div>
      ) : (
        <>
            <div>
                <h2 className="text-2xl font-semibold mb-6 border-l-4 border-primary pl-4">Em Jogo</h2>
                {ongoingGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ongoingGroups.map((group) => (
                      <PalpiteGroupCard key={group.bolao.id} bolao={group.bolao} palpites={group.palpitesDoUsuario} />
                    ))}
                </div>
                ) : (
                <p className="text-muted-foreground ml-5">Você não tem chutes em andamento.</p>
                )}
            </div>

            {completedGroups.length > 0 && <Separator />}

            <div>
                 <h2 className="text-2xl font-semibold mb-6 border-l-4 border-gray-500 pl-4">Histórico</h2>
                {completedGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {completedGroups.map((group) => (
                      <PalpiteGroupCard key={group.bolao.id} bolao={group.bolao} palpites={group.palpitesDoUsuario} />
                    ))}
                </div>
                ) : (
                 !loading && ongoingGroups.length > 0 && <p className="text-muted-foreground ml-5">Seu histórico de chutes está vazio.</p>
                )}
            </div>
        </>
      )}
    </div>
  );
}
