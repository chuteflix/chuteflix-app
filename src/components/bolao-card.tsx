
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { getParticipantCount } from "@/services/palpites"
import { Bolao } from "@/services/boloes"
import { Team } from "@/services/teams"
import { Championship } from "@/services/championships"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Users, Trophy, Info } from "lucide-react"

interface BolaoCardProps {
  bolao: Bolao
  teamA: Team | undefined
  teamB: Team | undefined
  championship: Championship | undefined
}

export function BolaoCard({ bolao, teamA, teamB, championship }: BolaoCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [participantCount, setParticipantCount] = useState(0)
  const [loadingParticipants, setLoadingParticipants] = useState(true)

  useEffect(() => {
    const fetchParticipantCount = async () => {
      setLoadingParticipants(true)
      const count = await getParticipantCount(bolao.id)
      setParticipantCount(count)
      setLoadingParticipants(false)
    }
    fetchParticipantCount()
  }, [bolao.id])

  if (!teamA || !teamB || !championship) {
    return null // ou um skeleton
  }

  const handleChutarClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user) {
      router.push(`/boloes/${bolao.id}`)
    } else {
      router.push('/login')
    }
  }
  
  const totalArrecadado = bolao.fee * participantCount
  const premioAtual = totalArrecadado * 0.90

  const statusMap: { [key: string]: { variant: "success" | "secondary" | "outline" | "destructive", label: string } } = {
    'Aberto': { variant: 'success', label: 'Aberto' },
    'Em breve': { variant: 'outline', label: 'Em Breve' },
    'Finalizado': { variant: 'destructive', label: 'Finalizado' },
  }
  const currentStatus = statusMap[bolao.status] || { variant: 'secondary', label: bolao.status }

  return (
    <TooltipProvider delayDuration={100}>
      <Card className="flex flex-col h-full w-full border-border hover:border-primary transition-all group overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-bold leading-tight line-clamp-2">{bolao.name}</h3>
              <p className="text-xs text-muted-foreground">{championship.name}</p>
            </div>
            <Badge variant={currentStatus.variant} className="shrink-0">{currentStatus.label}</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow p-4 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-around w-full">
                <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                        <AvatarImage src={teamA.shieldUrl} alt={teamA.name} />
                        <AvatarFallback>{teamA.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm max-w-[100px] truncate">{teamA.name}</span>
                </div>
                <div className="text-2xl font-bold text-muted-foreground px-2">VS</div>
                <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                        <AvatarImage src={teamB.shieldUrl} alt={teamB.name} />
                        <AvatarFallback>{teamB.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm max-w-[100px] truncate">{teamB.name}</span>
                </div>
            </div>
        </CardContent>

        <CardFooter className="p-4 bg-muted/30 flex flex-col gap-4">
            <div className="w-full flex justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold text-foreground">{loadingParticipants ? '...' : participantCount}</span>
                    <span>participantes</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <span className="font-semibold text-foreground">Taxa:</span>
                    <span>{bolao.fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
            </div>
            
            <Separator />
            
            <div className="w-full text-center">
                <p className="text-xs text-muted-foreground">Prêmio atual estimado</p>
                <p className="text-xl font-bold text-primary drop-shadow-sm">
                    {premioAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <p className="text-xs text-muted-foreground cursor-help flex items-center justify-center gap-1">
                            <span>Valor dividido entre os acertadores</span>
                            <Info className="h-3 w-3" />
                        </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-center">
                        <p>O prêmio é 90% do total arrecadado e será dividido igualmente entre todos que acertarem o placar exato da partida.</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            
            <Button 
                className="w-full font-bold" 
                onClick={handleChutarClick}
                disabled={bolao.status !== 'Aberto'}
            >
                {bolao.status === 'Aberto' ? 'Chutar Placar' : 'Ver Detalhes'}
            </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}
