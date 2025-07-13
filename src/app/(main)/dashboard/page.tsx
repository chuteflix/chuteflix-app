
"use client"

import { useState, useEffect } from "react"
import { getBoloes, Bolao } from "@/services/boloes"
import { getTeams, Team } from "@/services/teams"
import { getChampionships, Championship } from "@/services/championships"
import { BolaoCard } from "@/components/bolao-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
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
        console.error("Falha ao buscar dados para o dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  
  const findTeam = (id: string) => teams.find(t => t.id === id)
  const findChampionship = (id: string) => championships.find(c => c.id === id)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-foreground">Meus Chutes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)
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
          <p className="text-muted-foreground col-span-full">
            Você ainda não participou de nenhum bolão. Explore os bolões disponíveis!
          </p>
        )}
      </div>
    </div>
  )
}
