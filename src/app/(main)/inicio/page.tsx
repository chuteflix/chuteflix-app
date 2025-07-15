
"use client"

import { useState, useEffect, useMemo } from "react"
import { getBoloes, Bolao } from "@/services/boloes"
import { getTeams, Team } from "@/services/teams"
import { getChampionships, Championship } from "@/services/championships"
import { getParticipantCount } from "@/services/palpites"
import { BoloesCarousel } from "@/components/boloes-carousel"
import { Skeleton } from "@/components/ui/skeleton"
import { WelcomeBanner } from "@/components/welcome-banner"
import { subMinutes, isBefore } from 'date-fns'

type BolaoComDetalhes = Bolao & {
  teamADetails?: Team;
  teamBDetails?: Team;
  championshipDetails?: Championship;
  participantCount?: number;
};

const useCategorizedBoloes = (boloes: BolaoComDetalhes[]) => {
  return useMemo(() => {
    const now = new Date();
    const lastChanceTime = subMinutes(now, -59); // Data e hora 59 minutos no futuro

    const destaques = [...boloes].sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0)).slice(0, 10);
    const recentes = [...boloes].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()).slice(0, 10);
    const ultimaChance = boloes.filter(b => {
        const closingTime = new Date(`${b.matchDate}T${b.closingTime}`);
        return isBefore(closingTime, lastChanceTime) && isBefore(now, closingTime);
    });

    const brasileiros = boloes.filter(b => b.championshipDetails?.competitionType === 'national' && b.championshipDetails?.country === 'Brasil');
    const series = ['A', 'B', 'C', 'D'].map(serie => ({
        title: `Brasileirão Série ${serie}`,
        boloes: brasileiros.filter(b => b.championshipDetails?.series === serie)
    }));

    const estaduais = boloes.filter(b => b.championshipDetails?.scope === 'state');
    const amadores = boloes.filter(b => b.championshipDetails?.type === 'amateur');
    const internacionais = boloes.filter(b => b.championshipDetails?.competitionType === 'international');

    const categories = [
      { title: "Em Destaque", boloes: destaques },
      { title: "Última Chance", boloes: ultimaChance },
      { title: "Adicionados Recentemente", boloes: recentes },
      ...series,
      { title: "Campeonatos Estaduais", boloes: estaduais },
      { title: "Futebol Internacional", boloes: internacionais },
      { title: "Futebol Amador", boloes: amadores },
    ].filter(category => category.boloes.length > 0);

    return categories;
  }, [boloes]);
};

export default function InicioPage() {
  const [boloes, setBoloes] = useState<BolaoComDetalhes[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [boloesData, teamsData, championshipsData] = await Promise.all([
          getBoloes(),
          getTeams(),
          getChampionships(),
        ]);

        const availableBoloes = boloesData.filter(b => b.status !== 'Finalizado');

        const detailedBoloes = await Promise.all(
          availableBoloes.map(async (bolao) => {
            const [teamADetails, teamBDetails, championshipDetails, participantCount] = await Promise.all([
              teamsData.find(t => t.id === bolao.teamAId),
              teamsData.find(t => t.id === bolao.teamBId),
              championshipsData.find(c => c.id === bolao.championshipId),
              getParticipantCount(bolao.id)
            ]);
            return { ...bolao, teamADetails, teamBDetails, championshipDetails, participantCount };
          })
        );
        
        setBoloes(detailedBoloes);

      } catch (error) {
        console.error("Falha ao buscar dados para a página inicial:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  
  const categorizedBoloes = useCategorizedBoloes(boloes);

  if (loading) {
    return (
      <div className="space-y-8">
        <WelcomeBanner />
        {Array.from({length: 4}).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-8 w-64 mb-4" />
            <div className="flex space-x-6 overflow-hidden">
              {Array.from({length: 4}).map((_, j) => (
                <Skeleton key={j} className="h-80 w-64 rounded-lg flex-shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <WelcomeBanner />

      {categorizedBoloes.map(({ title, boloes }) => (
        <BoloesCarousel key={title} title={title} boloes={boloes} />
      ))}

      {boloes.length === 0 && !loading && (
        <div className="text-center bg-muted/20 border-2 border-dashed border-border/30 rounded-lg py-20 col-span-full">
            <h3 className="text-2xl font-bold">Nenhum bolão disponível no momento.</h3>
            <p className="text-muted-foreground mt-2">Fique de olho! Novas oportunidades surgirão em breve.</p>
        </div>
      )}
    </div>
  )
}
