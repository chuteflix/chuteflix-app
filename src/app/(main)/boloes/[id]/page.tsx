
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Bolao } from "@/services/boloes"
import { getTeamById, Team } from "@/services/teams"
import { getChampionshipById, Championship } from "@/services/championships"
import { Palpite, getPalpitesByBolaoId } from "@/services/palpites"
import { getUserProfile, UserProfile } from "@/services/users"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PalpiteModal } from "@/components/palpite-modal"
import { PalpiteCard } from "@/components/palpite-card"
import { ArrowLeft, Calendar, Shield, Trophy, MessageSquare } from "lucide-react"
import Link from "next/link"

type BolaoDetails = Bolao & {
  team1Details?: Team
  team2Details?: Team
  championshipDetails?: Championship
}

type PalpiteWithUser = Palpite & { user?: UserProfile }

export default function BolaoPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const id = params.id as string

  const [bolao, setBolao] = useState<BolaoDetails | null>(null)
  const [palpites, setPalpites] = useState<PalpiteWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchBolaoData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch Bolão Details
        const bolaoDoc = await getDoc(doc(db, "boloes", id))
        if (!bolaoDoc.exists()) throw new Error("Bolão não encontrado.")
        const bolaoData = { id: bolaoDoc.id, ...bolaoDoc.data() } as Bolao
        
        const [team1Details, team2Details, championshipDetails] = await Promise.all([
          getTeamById(bolaoData.team1Id),
          getTeamById(bolaoData.team2Id),
          getChampionshipById(bolaoData.championshipId),
        ])
        setBolao({ ...bolaoData, team1Details, team2Details, championshipDetails })

        // Fetch Palpites and User data
        const approvedPalpites = await getPalpitesByBolaoId(id, "Aprovado")
        const palpitesWithUsers = await Promise.all(
          approvedPalpites.map(async palpite => {
            const userProfile = await getUserProfile(palpite.userId)
            return { ...palpite, user: userProfile || undefined }
          })
        )
        setPalpites(palpitesWithUsers)

      } catch (err) {
        console.error("Erro ao buscar dados do bolão:", err)
        setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.")
      } finally {
        setLoading(false)
      }
    }

    fetchBolaoData()
  }, [id])
  
  const handleChutarClick = () => {
    if (!user) router.push("/login")
    else setIsModalOpen(true)
  }
  
  const MatchInfo = () => (
    <div className="flex items-center justify-center space-x-4 sm:space-x-8 md:space-x-12 my-6">
       <div className="flex flex-col items-center gap-3 text-center">
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-border">
          <AvatarImage src={bolao?.team1Details?.logoUrl} alt={bolao?.team1Details?.name} />
          <AvatarFallback>{bolao?.team1Details?.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-lg">{bolao?.team1Details?.name}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-muted-foreground">VS</div>
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-border">
          <AvatarImage src={bolao?.team2Details?.logoUrl} alt={bolao?.team2Details?.name} />
          <AvatarFallback>{bolao?.team2Details?.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-lg">{bolao?.team2Details?.name}</span>
      </div>
    </div>
  )
  
  if (loading || authLoading) {
    // Basic skeleton loader
    return <div className="container mx-auto p-4"><Skeleton className="h-96 w-full" /></div>
  }

  if (error) {
    return <div className="container mx-auto p-4"><Alert variant="destructive"><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Voltar para Início</Link>
        </Button>
        
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-2xl sm:text-3xl font-bold">{bolao?.name}</CardTitle>
              <Badge variant={bolao?.status === 'Aberto' ? 'default' : 'secondary'}>{bolao?.status}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1.5"><Trophy className="h-4 w-4" /><span>{bolao?.championshipDetails?.name || 'Campeonato'}</span></div>
              <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /><span>Encerra em: {new Date(bolao?.closingDate || '').toLocaleDateString('pt-BR')}</span></div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <MatchInfo />
            <Separator className="my-6" />
            <div className="text-center">
              <Button size="lg" onClick={handleChutarClick} disabled={bolao?.status !== 'Aberto'}>
                Chutar Placar
              </Button>
              {bolao?.status !== 'Aberto' && <p className="text-sm text-muted-foreground mt-3">Este bolão não está mais aceitando palpites.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6"/>
                    Comentários dos Chutes
                </CardTitle>
                <CardDescription>Veja o que outros torcedores estão chutando para esta partida.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {palpites.length > 0 ? (
                    palpites.map(palpite => (
                        <PalpiteCard key={palpite.id} palpite={palpite} />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>Nenhum palpite aprovado ainda.</p>
                        <p className="text-sm">Seja o primeiro a chutar!</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

      {bolao && (
        <PalpiteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          bolao={bolao}
        />
      )}
    </>
  )
}
