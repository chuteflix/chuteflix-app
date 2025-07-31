
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { getParticipantCount } from "@/services/palpites"
import { Bolao, Team } from "@/types" 

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Users, Trophy, Info, AlertCircle, Heart } from "lucide-react" // Importando Heart
import { parse, format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

interface BolaoCardProps {
  bolao: Bolao;
}

function HydratedBolaoCard({ bolao }: BolaoCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [participantCount, setParticipantCount] = useState(0)
  const [loadingParticipants, setLoadingParticipants] = useState(true)
  const [isClosingTimePassed, setIsClosingTimePassed] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false) // Estado para favorito

  useEffect(() => {
    // Lógica para buscar contagem de participantes
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

    // Lógica para verificar tempo de encerramento
    const checkClosingTime = () => {
        if (bolao.matchStartDate && bolao.closingTime) {
            try {
                // @ts-ignore
                const closingDateTime = parse(`${format(new Date(bolao.matchStartDate), 'yyyy-MM-dd')} ${format(bolao.closingTime, 'HH:mm')}`, 'yyyy-MM-dd HH:mm', new Date());
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

    // Lógica para carregar favoritos do localStorage
    const favorites = JSON.parse(localStorage.getItem('favoriteBoloes') || '[]');
    setIsFavorite(favorites.includes(bolao.id));

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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let favorites = JSON.parse(localStorage.getItem('favoriteBoloes') || '[]');
    if (isFavorite) {
      favorites = favorites.filter((id: string) => id !== bolao.id);
    } else {
      favorites.push(bolao.id);
    }
    localStorage.setItem('favoriteBoloes', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };
  
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

  const matchDate = bolao.matchStartDate ? format(new Date(bolao.matchStartDate), 'dd/MM/yyyy') : 'N/A';
  const matchTime = bolao.matchStartDate ? format(new Date(bolao.matchStartDate), 'HH:mm') : 'N/A';

  return (
    <TooltipProvider delayDuration={100}>
      <Card className="flex flex-col h-full w-full border-border hover:border-primary transition-all group overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-bold leading-tight line-clamp-2 text-lg">{`${bolao.homeTeam.name} vs ${bolao.awayTeam.name}`}</h3>
              <p className="text-xs text-muted-foreground">{bolao.championship}</p>
              <p className="text-xs text-muted-foreground mt-1">{matchDate} às {matchTime}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
                <Badge variant={currentStatusStyle.variant} className="shrink-0">{currentStatusStyle.label}</Badge>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleFavoriteClick} 
                    className="text-muted-foreground hover:text-primary"
                >
                    <Heart className={isFavorite ? "fill-current text-primary" : ""} />
                </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow p-4 pt-2 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-around w-full">
                <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                        <AvatarImage src={bolao.homeTeam.shieldUrl} alt={bolao.homeTeam.name} />
                        <AvatarFallback>{bolao.homeTeam.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm max-w-[100px] truncate">{bolao.homeTeam.name}</span>
                </div>
                <div className="text-2xl font-bold text-muted-foreground px-2">VS</div>
                <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                        <AvatarImage src={bolao.awayTeam.shieldUrl} alt={bolao.awayTeam.name} />
                        <AvatarFallback>{bolao.awayTeam.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm max-w-[100px] truncate">{bolao.awayTeam.name}</span>
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

export function BolaoCard({ bolao }: BolaoCardProps) {
  if (!bolao.homeTeam || !bolao.awayTeam) {
    console.error(`BolaoCard: Times ausentes para o bolão ID: ${bolao.id}`);
    return null; 
  }

  return <HydratedBolaoCard bolao={bolao} />;
}
