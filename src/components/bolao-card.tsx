
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { getParticipantCount } from "@/services/palpites"
import { Bolao } from "@/types" 
import { useToast } from "@/hooks/use-toast"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Trophy, Info, AlertCircle, Heart, Star, Clock, Flame } from "lucide-react"
import { format, isValid, differenceInHours } from "date-fns"
import { cn } from "@/lib/utils"
import Countdown from "react-countdown"

interface BolaoCardProps {
  bolao: Bolao;
}

function HydratedBolaoCard({ bolao }: BolaoCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [participantCount, setParticipantCount] = useState(0)
  const [loadingParticipants, setLoadingParticipants] = useState(true)
  const [isClosingTimePassed, setIsClosingTimePassed] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isHovering, setIsHovering] = useState(false)


  const isHighDemand = participantCount > 50 && bolao.status === 'Aberto';
  const isLastCall = bolao.maxParticipants && participantCount / bolao.maxParticipants > 0.9 && bolao.status === 'Aberto';

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
        if (bolao.closingTime && isValid(new Date(bolao.closingTime))) {
            if (new Date() > new Date(bolao.closingTime)) {
                setIsClosingTimePassed(true);
            }
        }
    };
    checkClosingTime();
    const interval = setInterval(checkClosingTime, 60000);

    if(user) {
        const favorites = JSON.parse(localStorage.getItem(`favoriteBoloes_${user.uid}`) || '[]');
        setIsFavorite(favorites.includes(bolao.id));
    }

    return () => clearInterval(interval);
  }, [bolao.id, bolao.closingTime, user])

  const handleChutarClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/boloes/${bolao.id}`)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
        toast({
            title: "Crie sua conta!",
            description: "Você precisa estar logado para salvar seus bolões favoritos.",
            variant: "destructive"
        });
        return;
    }
    let favorites = JSON.parse(localStorage.getItem(`favoriteBoloes_${user.uid}`) || '[]');
    if (isFavorite) {
      favorites = favorites.filter((id: string) => id !== bolao.id);
    } else {
      favorites.push(bolao.id);
    }
    localStorage.setItem(`favoriteBoloes_${user.uid}`, JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
    toast({
        title: isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos!",
        description: `O bolão ${bolao.homeTeam.name} vs ${bolao.awayTeam.name} foi ${isFavorite ? 'removido da sua lista.' : 'adicionado à sua lista.'}`
    })
  };
  
  const totalArrecadado = bolao.betAmount * participantCount
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

  const UrgencyBadge = () => {
    if (!bolao.closingTime || bolao.status !== 'Aberto') return null;

    const hoursUntilEnd = differenceInHours(new Date(bolao.closingTime), new Date());

    if (hoursUntilEnd < 1) {
        return <Badge variant="destructive" className="text-xs font-bold animate-pulse"><Flame className="mr-1 h-3 w-3" />ÚLTIMA HORA</Badge>
    }
    if (hoursUntilEnd < 24) {
        return <Badge variant="outline" className="text-xs border-amber-500 text-amber-500"><Clock className="mr-1 h-3 w-3" />-24 HORAS</Badge>
    }
    return null;
  }
  
  const countdownRenderer = ({ days, hours, minutes, seconds, completed }: any) => {
    if (completed || isClosingTimePassed) {
      return <div className="text-center font-bold text-sm text-destructive">{displayStatus === 'Finalizado' ? 'Finalizado' : 'Encerrado'}</div>;
    } else {
        const d = String(days).padStart(2, '0');
        const h = String(hours).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');
        return (
             <div className="flex items-center justify-center gap-2 font-mono text-center tabular-nums">
                <div><div className="text-lg font-bold">{d}</div><div className="text-[10px] text-muted-foreground">DIAS</div></div>
                <div>:</div>
                <div><div className="text-lg font-bold">{h}</div><div className="text-[10px] text-muted-foreground">HORAS</div></div>
                <div>:</div>
                <div><div className="text-lg font-bold">{m}</div><div className="text-[10px] text-muted-foreground">MIN</div></div>
                <div>:</div>
                <div><div className="text-lg font-bold">{s}</div><div className="text-[10px] text-muted-foreground">SEG</div></div>
             </div>
        );
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Card 
        className="flex flex-col h-full w-full border-border hover:border-primary transition-all group overflow-hidden relative active:border-primary/80 active:shadow-lg"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Tooltip>
            <TooltipTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleFavoriteClick} 
                    className={cn("absolute top-2 right-2 z-10 text-muted-foreground hover:text-primary transition-transform hover:scale-110", isFavorite && "text-primary")}
                >
                    <Heart className={cn("transition-all", isFavorite && "fill-current")} />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}</p>
            </TooltipContent>
        </Tooltip>
        
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {isLastCall && (
                <Badge variant="destructive" className="animate-pulse">
                    <AlertCircle className="h-3 w-3 mr-1" /> ÚLTIMAS VAGAS!
                </Badge>
            )}
            {isHighDemand && !isLastCall && (
                <Badge variant="default" className="bg-amber-500 text-black hover:bg-amber-500/90">
                    <Star className="h-3 w-3 mr-1" /> Popular
                </Badge>
            )}
        </div>

        <CardHeader className="p-4 pb-2">
            <h3 className="font-bold leading-tight text-base">{`${bolao.homeTeam.name} vs ${bolao.awayTeam.name}`}</h3>
            <p className="text-xs text-muted-foreground">{bolao.championship}</p>
            <div className="flex items-center justify-between mt-1">
                <p className="text-sm font-semibold text-foreground">
                    {bolao.matchStartDate && isValid(new Date(bolao.matchStartDate)) ? format(new Date(bolao.matchStartDate), "dd/MM 'às' HH:mm'h'") : 'Data a definir'}
                </p>
            </div>
        </CardHeader>
        
        <CardContent className="flex-grow p-4 pt-2 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-around w-full">
                <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-transparent group-hover:border-primary/50 transition-colors">
                        <AvatarImage src={bolao.homeTeam.shieldUrl} alt={bolao.homeTeam.name} />
                        <AvatarFallback>{bolao.homeTeam.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm min-h-[40px]">{bolao.homeTeam.name}</span>
                </div>
                <div className="text-2xl font-bold text-muted-foreground px-2">VS</div>
                <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-transparent group-hover:border-primary/50 transition-colors">
                        <AvatarImage src={bolao.awayTeam.shieldUrl} alt={bolao.awayTeam.name} />
                        <AvatarFallback>{bolao.awayTeam.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm min-h-[40px]">{bolao.awayTeam.name}</span>
                </div>
            </div>
        </CardContent>

        <CardFooter className="p-4 bg-muted/30 flex flex-col gap-3">
            <div className="w-full text-center border-2 border-dashed border-primary/50 bg-primary/10 rounded-lg py-2">
                <p className="text-xs text-primary font-semibold">Prêmio estimado</p>
                <p className="text-2xl font-bold text-primary drop-shadow-sm">
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

            {bolao.closingTime && bolao.status === 'Aberto' && !isClosingTimePassed && (
                <div className="w-full p-2 border border-dashed rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-1">
                       <Clock className="h-3 w-3"/> <span>Tempo para chutar</span>
                    </div>
                    <Countdown date={new Date(bolao.closingTime)} renderer={countdownRenderer} />
                </div>
            )}
            
            <div className="w-full flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {loadingParticipants ? <div className="h-4 w-4 rounded-full bg-muted-foreground/50 animate-pulse" /> : <span className="font-semibold text-foreground">{participantCount}</span>}
                    <span>participantes</span>
                </div>
                <UrgencyBadge />
            </div>
            
            <Button
                className="w-full font-bold transition-transform hover:scale-105 active:scale-[1.02]"
                onClick={handleChutarClick}
                disabled={isButtonDisabled}
            >
                {isButtonDisabled && <AlertCircle className="mr-2 h-4 w-4" />}
                {buttonText()}
                <span className="ml-2">| {bolao.betAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}

export function BolaoCard({ bolao }: BolaoCardProps) {
  if (!bolao.homeTeam || !bolao.awayTeam) {
    return null; 
  }

  return <HydratedBolaoCard bolao={bolao} />;
}
