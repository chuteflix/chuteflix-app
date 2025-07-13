
"use client"

import { useState, useEffect } from "react"
import { getBoloes, Bolao } from "@/services/boloes"
import { getTeams, Team } from "@/services/teams"
import { getChampionships, Championship } from "@/services/championships"
import { BolaoCard } from "@/components/bolao-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
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
        console.error("Falha ao buscar dados para a home page:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const findTeam = (id: string) => teams.find(t => t.id === id)
  const findChampionship = (id: string) => championships.find(c => c.id === id)

  const groupBoloes = () => {
    const groups: { [key: string]: Bolao[] } = {
      'Competições Nacionais': [],
      'Competições Estaduais': [],
      'Amador/Várzea': [],
      'Outros': [],
    }

    boloes.forEach(bolao => {
      const championship = findChampionship(bolao.championshipId)
      if (!championship) {
        groups['Outros'].push(bolao)
        return
      }

      if (championship.type === 'amateur') {
        groups['Amador/Várzea'].push(bolao)
      } else if (championship.type === 'professional') {
        if (championship.scope === 'national') {
          groups['Competições Nacionais'].push(bolao)
        } else if (championship.scope === 'state') {
          groups['Competições Estaduais'].push(bolao)
        } else {
          groups['Outros'].push(bolao)
        }
      }
    })
    return groups
  }
  
  const groupedBoloes = groupBoloes();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-foreground">Bolões Disponíveis</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
        </div>
      ) : (
        Object.keys(groupedBoloes).map(groupName => {
          const groupList = groupedBoloes[groupName];
          if (groupList.length === 0) return null;

          return (
            <section key={groupName} className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 border-l-4 border-primary pl-4">{groupName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupList.map(bolao => (
                  <BolaoCard 
                    key={bolao.id}
                    bolao={bolao}
                    teamA={findTeam(bolao.teamAId)}
                    teamB={findTeam(bolao.teamBId)}
                    championship={findChampionship(bolao.championshipId)}
                  />
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
