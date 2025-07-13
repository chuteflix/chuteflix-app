
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { getPalpitesByUser, PalpiteComDetalhes } from "@/services/palpites"
import { getBolaoById } from "@/services/boloes"
import { getTeamById } from "@/services/teams"
import { getChampionshipById } from "@/services/championships"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Ticket } from "lucide-react"

export default function MeusChutesPage() {
  const { user } = useAuth()
  const [palpites, setPalpites] = useState<PalpiteComDetalhes[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchPalpites = async () => {
      setLoading(true)
      try {
        const userPalpites = await getPalpitesByUser(user.uid)
        
        const palpitesComDetalhes = await Promise.all(
          userPalpites.map(async (palpite) => {
            const bolaoDetails = await getBolaoById(palpite.bolaoId)
            if (!bolaoDetails) return palpite // Retorna o palpite sem detalhes se o bolão não for encontrado

            const [team1Details, team2Details, championshipDetails] = await Promise.all([
                getTeamById(bolaoDetails.team1Id),
                getTeamById(bolaoDetails.team2Id),
                getChampionshipById(bolaoDetails.championshipId),
            ]);

            return {
              ...palpite,
              bolaoDetails: {
                ...bolaoDetails,
                team1Details,
                team2Details,
                championshipDetails,
              },
            }
          })
        )
        
        setPalpites(palpitesComDetalhes)
      } catch (err) {
        setError("Não foi possível carregar seus chutes. Tente novamente mais tarde.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPalpites()
  }, [user])

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Meus Chutes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <Alert variant="destructive"><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Meus Chutes</h1>
      {palpites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {palpites.map((palpite) => (
            <Card key={palpite.id} className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg">{palpite.bolaoDetails?.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{palpite.bolaoDetails?.championshipDetails?.name}</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8"><AvatarImage src={palpite.bolaoDetails?.team1Details?.logoUrl} /><AvatarFallback>T1</AvatarFallback></Avatar>
                    <span className="font-semibold">{palpite.bolaoDetails?.team1Details?.name}</span>
                  </div>
                  <div className="text-2xl font-bold">{palpite.scoreTeam1}</div>
                </div>
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8"><AvatarImage src={palpite.bolaoDetails?.team2Details?.logoUrl} /><AvatarFallback>T2</AvatarFallback></Avatar>
                    <span className="font-semibold">{palpite.bolaoDetails?.team2Details?.name}</span>
                  </div>
                  <div className="text-2xl font-bold">{palpite.scoreTeam2}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-4">
                  Chute feito em: {new Date(palpite.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum chute encontrado</h3>
            <p className="mt-2 text-sm text-muted-foreground">Você ainda não tem palpites com pagamento aprovado.</p>
        </div>
      )}
    </div>
  )
}
