
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { getParticipantCount } from "@/services/palpites"
import { getTeamById } from "@/services/teams" // Importado
import { Bolao, Team } from "@/types" // Bolao aqui é o "cru"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Users, Trophy, Info, AlertCircle } from "lucide-react"
import { parse, format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

interface BolaoCardProps {
  bolao: Omit<Bolao, 'homeTeam' | 'awayTeam'> & { homeTeamId: string; awayTeamId: string };
}

// Componente "interno" que renderiza o card após os dados dos times serem carregados
function HydratedBolaoCard({ bolao, homeTeam, awayTeam }: { bolao: BolaoCardProps['bolao'], homeTeam: Team, awayTeam: Team }) {
  const { user } = useAuth()
  const router = useRouter()
  const [participantCount, setParticipantCount] = useState(0)
  const [loadingParticipants, setLoadingParticipants] = useState(true)
  const [isClosingTimePassed, setIsClosingTimePassed] = useState(false)

  useEffect(() => {
    const fetchParticipantCount = async () => {
      setLoadingParticipants(true);
      try {
        const count = await getParticipantCount(bolao.id);
        setParticipantCount(count);
      } catch (error) {
        console.error("Erro ao buscar participantes:", error);
      } finally {
        setLoadingParticipants(false);
      }
    };
    fetchParticipantCount()

    const checkClosingTime = () => {
        if (bolao.matchStartDate && bolao.closingTime) {
            try {
                // @ts-ignore
                const closingDateTime = parse(`${format(new Date(bolao.matchStartDate), 'yyyy-MM-dd')} ${bolao.closingTime}`, 'yyyy-MM-dd HH:mm', new Date());
                if (!isNaN(closingDateTime.getTime()) && new Date() > closingDateTime) {
                    setIsClosingTimePassed(true);
                }
            } catch (error) {
                console.error("Erro ao parsear data de fechamento:", error);
            }
        }
    };

    checkClosingTime();
    const interval = setInterval(checkClosingTime, 60000);

    return () => clearInterval(interval);
  }, [bolao.id, bolao.matchStartDate, bolao.closingTime])

  const handleChutarClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (user) {
      router.push(`/boloes/${bolao.id}`)
    } else {
      router.push('/login')
    }
  }
  
  const totalArrecadado = bolao.betAmount * participantCount
  // @ts-ignore
  const premioAtual = (bolao.initialPrize || 0) + (totalArrecadado * 0.90)

  const displayStatus = isClosingTimePassed && bolao.status === 'Aberto' ? 'Fechado' : bolao.status;

  const statusMap: { [key: string]: { variant: "success" | "secondary" | "destructive" | "outline", label: string } } = {
    'Aberto': { variant: 'success', label: 'Aberto' },
    'Fechado': { variant: 'secondary', label: 'Fechado' },
    'Finalizado': { variant: 'destructive', label: 'Finalizado' },
  }
  const currentStatusStyle = statusMap[displayStatus] || { variant: 'outline', label: displayStatus }

  const isButtonDisabled = displayStatus === 'Fechado' || displayStatus === 'Finalizado';
  
  const buttonText = () => {
    if (displayStatus === 'Finalizado') return 'Ver Resultados';
    if (displayStatus === 'Fechado') return 'Chutes Encerrados';
    return 'Chutar Placar';
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Card className="flex flex-col h-full w-full border-border hover:border-primary transition-all group overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-bold leading-tight line-clamp-2">{`${homeTeam.name} vs ${awayTeam.name}`}</h3>
              <p className="text-xs text-muted-foreground">{bolao.championship}</p>
            </div>
            <Badge variant={currentStatusStyle.variant} className="shrink-0">{currentStatusStyle.label}</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow p-4 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-around w-full">
                <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                        <AvatarImage src={homeTeam.logoUrl} alt={homeTeam.name} />
                        <AvatarFallback>{homeTeam.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm max-w-[100px] truncate">{homeTeam.name}</span>
                </div>
                <div className="text-2xl font-bold text-muted-foreground px-2">VS</div>
                <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                        <AvatarImage src={awayTeam.logoUrl} alt={awayTeam.name} />
                        <AvatarFallback>{awayTeam.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm max-w-[100px] truncate">{awayTeam.name}</span>
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
                    <span>{bolao.betAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
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
                        <p>O prêmio é o valor inicial mais 90% do total arrecadado com as taxas, e será dividido igualmente entre todos que acertarem o placar exato.</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            
            <Button
                className="w-full font-bold"
                onClick={handleChutarClick}
                disabled={isButtonDisabled}
            >
                {isButtonDisabled && <AlertCircle className="mr-2 h-4 w-4" />}
                {buttonText()}
            </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}


// Componente principal que faz o fetching dos dados dos times
export function BolaoCard({ bolao }: BolaoCardProps) {
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      const [home, away] = await Promise.all([
        getTeamById(bolao.homeTeamId),
        getTeamById(bolao.awayTeamId)
      ]);
      setHomeTeam(home);
      setAwayTeam(away);
      setLoading(false);
    };

    fetchTeams();
  }, [bolao.homeTeamId, bolao.awayTeamId]);

  if (loading) {
    return (
      <Card className="flex flex-col h-full w-full border-border">
        <CardHeader className="p-4">
            <Skeleton className="h-5 w-3/4"/>
            <Skeleton className="h-3 w-1/4"/>
        </CardHeader>
        <CardContent className="flex-grow p-4 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-around w-full">
                <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-20 w-20 rounded-full"/>
                    <Skeleton className="h-4 w-16"/>
                </div>
                <Skeleton className="h-6 w-8"/>
                <div className="flex flex-col items-center gap-2">
                    <Skeleton className="h-20 w-20 rounded-full"/>
                    <Skeleton className="h-4 w-16"/>
                </div>
            </div>
        </CardContent>
        <CardFooter className="p-4 bg-muted/30 flex flex-col gap-4">
            <Skeleton className="h-10 w-full"/>
        </CardFooter>
      </Card>
    );
  }

  if (!homeTeam || !awayTeam) {
    // Retorna null ou um card de erro se os times não puderem ser carregados
    return null; 
  }

  return <HydratedBolaoCard bolao={bolao} homeTeam={homeTeam} awayTeam={awayTeam} />;
}
