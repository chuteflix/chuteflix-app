
"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { Bolao } from "@/services/boloes"
import { Team } from "@/services/teams"
import { Championship } from "@/services/championships"
import { CircleDot } from "lucide-react"

interface BolaoCardProps {
  bolao: Bolao
  teamA: Team | undefined
  teamB: Team | undefined
  championship: Championship | undefined
}

export function BolaoCard({ bolao, teamA, teamB, championship }: BolaoCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  
  if (!teamA || !teamB || !championship) {
    return null
  }

  const handleChutarClick = () => {
    if (user) {
      // Lógica para abrir o modal de chute (a ser implementada)
      console.log("Abrir modal de chute para o bolão:", bolao.id)
    } else {
      router.push('/login')
    }
  }

  return (
    <Card className="w-full max-w-sm border-border hover:border-primary transition-all group overflow-hidden">
        <CardHeader className="p-4">
            <div className="flex justify-between items-center">
                <Badge variant={bolao.status === 'Ativo' ? 'default' : 'outline'}>{bolao.status}</Badge>
                <p className="text-xs text-muted-foreground">
                    {new Date(bolao.matchDate).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', timeZone: 'UTC'})}
                    {' - '}
                    {bolao.startTime}
                </p>
            </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-4 aspect-video relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black z-10"/>
            <Avatar className="h-24 w-24 absolute left-4 top-1/2 -translate-y-1/2 z-20">
                <AvatarImage src={teamA.shieldUrl} alt={teamA.name} />
                <AvatarFallback>{teamA.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <Avatar className="h-24 w-24 absolute right-4 top-1/2 -translate-y-1/2 z-20">
                <AvatarImage src={teamB.shieldUrl} alt={teamB.name} />
                <AvatarFallback>{teamB.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="z-20 text-center">
                <p className="font-bold text-4xl text-white drop-shadow-lg">VS</p>
                <p className="text-sm text-muted-foreground mt-2">{championship.name}</p>
            </div>
        </CardContent>
        <CardFooter className="p-4 bg-muted/50 transition-all duration-300 opacity-0 group-hover:opacity-100">
            <div className="w-full flex justify-between items-center">
                <div className="text-left">
                    <p className="text-sm font-semibold">{`${teamA.name} vs ${teamB.name}`}</p>
                    <p className="text-xs text-muted-foreground">Aposta: {bolao.fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <Button size="sm" onClick={handleChutarClick}>
                    <CircleDot className="h-4 w-4 mr-2" />
                    Chutar
                </Button>
            </div>
        </CardFooter>
    </Card>
  )
}
