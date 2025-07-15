
"use client"

import { useState, useEffect } from "react"
import { getBoloes, Bolao } from "@/services/boloes"
import { getTeams, Team } from "@/services/teams"
import { getChampionships, Championship } from "@/services/championships"
import { BolaoCard } from "@/components/bolao-card"
import { Skeleton } from "@/components/ui/skeleton"
import { WelcomeBanner } from "@/components/welcome-banner"

export default function InicioPage() {
  const [boloes, setBoloes] = useState<Bolao[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [boloesData, teamsData, championshipsData] = await Promise.all([
          getBoloes(),
          getTeams(),
          getChampionships(),
        ])
        setBoloes(boloesData.filter(b => b.status !== 'Finalizado'))
        setTeams(teamsData)
        setChampionships(championshipsData)
      } catch (error) {
        console.error("Falha ao buscar dados para a página inicial:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  
  const findTeam = (id: string) => teams.find(t => t.id === id)
  const findChampionship = (id: string) => championships.find(c => c.id === id)

  return (
    <div className="space-y-8">
      <WelcomeBanner />

      <div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">Bolões Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-lg" />)
          ) : boloes.length > 0 ? (
            boloes.map(bolao => (
              <BolaoCard 
                key={bolao.id}
                bolao={bolao}
                teamA={findTeam(bolao.teamAId)}
                teamB={findTeam(bolao.teamBId)}
                championship={findChampionship(bolao.championshipId)}
              />
            ))
          ) : (
            <div className="text-center bg-muted/20 border-2 border-dashed border-border/30 rounded-lg py-20 col-span-full">
              <h3 className="text-2xl font-bold">Nenhum bolão disponível no momento.</h3>
              <p className="text-muted-foreground mt-2">Fique de olho! Novas oportunidades surgirão em breve.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
