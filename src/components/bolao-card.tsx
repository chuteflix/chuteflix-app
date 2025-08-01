
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
import { Separator } from "@/components/ui/separator"
import { Users, Trophy, Info, AlertCircle, Heart, Star } from "lucide-react"
import { format, isValid } from "date-fns"
import { cn } from "@/lib/utils"

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
        if (bolao.matchStartDate && bolao.closingTime) {
            const matchDate = new Date(bolao.matchStartDate);
            if (isValid(matchDate)) {
                const datePart = format(matchDate, 'yyyy-MM-dd');
                const closingDateTimeString = `${datePart}T${bolao.closingTime}`;
                const closingDateTime = new Date(closingDateTimeString);
                if (isValid(closingDateTime) && new Date() > closingDateTime) {
                    setIsClosingTimePassed(true);
                }
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
  }, [bolao.id, bolao.matchStartDate, bolao.closingTime, user])

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

  const matchDate = bolao.matchStartDate ? format(new Date(bolao.matchStartDate), 'dd/MM/yyyy') : 'N/A';
  const matchTime = bolao.matchStartDate ? format(new Date(bolao.matchStartDate), 'HH:mm') : 'N/A';

  return (
    <TooltipProvider delayDuration={100}>
      <Card className="flex flex-col h-full w-full border-border hover:border-primary transition-all group overflow-hidden relative">
        {/* Favorite Button */}
        <Tooltip>
            <TooltipTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleFavoriteClick} 
                    className={cn("absolute top-2 right-2 z-10 text-muted-foreground hover:text-primary", isFavorite && "text-primary")}
                >
                    <Heart className={cn(isFavorite && "fill-current")} />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}</p>
            </TooltipContent>
        </Tooltip>
        
        {/* Urgency Tags */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {isLastCall && (
                <Badge variant="destructive" className="animate-pulse">
                    <AlertCircle className="h-3 w-3 mr-1" /> ÚLTIMAS VAGAS!
                </Badge>
            )}
            {isHighDemand && !isLastCall && (
                <Badge variant="premium">
                    <Star className="h-3 w-3 mr-1" /> Popular
                </Badge>
            )}
        </div>

        <CardHeader className="p-4 pb-2">
            <h3 className="font-bold leading-tight line-clamp-2 text-base pr-8">{`${bolao.homeTeam.name} vs ${bolao.awayTeam.name}`}</h3>
            <p className="text-xs text-muted-foreground">{bolao.championship}</p>
            <p className="text-xs text-muted-foreground mt-1">{matchDate} às {matchTime}</p>
        </CardHeader>
        
        <CardContent className="flex-grow p-4 pt-2 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-around w-full">
                <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-transparent group-hover:border-primary/50 transition-colors">
                        <AvatarImage src={bolao.homeTeam.shieldUrl} alt={bolao.homeTeam.name} />
                        <AvatarFallback>{bolao.homeTeam.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm max-w-[100px] truncate">{bolao.homeTeam.name}</span>
                </div>
                <div className="text-2xl font-bold text-muted-foreground px-2">VS</div>
                <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-transparent group-hover:border-primary/50 transition-colors">
                        <AvatarImage src={bolao.awayTeam.shieldUrl} alt={bolao.awayTeam.name} />
                        <AvatarFallback>{bolao.awayTeam.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm max-w-[100px] truncate">{bolao.awayTeam.name}</span>
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
            
            <div className="w-full flex justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {loadingParticipants ? <div className="h-4 w-4 rounded-full bg-muted-foreground/50 animate-pulse" /> : <span className="font-semibold text-foreground">{participantCount}</span>}
                    <span>participantes</span>
                </div>
                <Badge variant={currentStatusStyle.variant} className="shrink-0">{currentStatusStyle.label}</Badge>
            </div>
            
            <Button
                className="w-full font-bold"
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
