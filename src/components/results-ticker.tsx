"use client";

import { useState, useEffect, Fragment } from "react";
import { getFinishedBoloes } from "@/services/boloes";
import { Bolao } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const TickerItem = ({ bolao }: { bolao: Bolao }) => (
  <div className="flex items-center gap-3 text-sm mx-4 whitespace-nowrap flex-shrink-0">
    <span className="font-light text-muted-foreground">{bolao.championship}</span>
    <div className="flex items-center gap-2">
      <Avatar className="h-5 w-5">
        <AvatarImage src={bolao.homeTeam.shieldUrl} alt={bolao.homeTeam.name} />
        <AvatarFallback>{bolao.homeTeam.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <span className="font-semibold text-foreground">{bolao.homeTeam.name}</span>
      <span className="font-bold text-sm text-primary-foreground bg-foreground/80 rounded-md px-1.5 py-0.5">{bolao.homeScore}</span>
      <span className="text-muted-foreground/80 mx-1">x</span>
      <span className="font-bold text-sm text-primary-foreground bg-foreground/80 rounded-md px-1.5 py-0.5">{bolao.awayScore}</span>
      <span className="font-semibold text-foreground">{bolao.awayTeam.name}</span>
      <Avatar className="h-5 w-5">
        <AvatarImage src={bolao.awayTeam.shieldUrl} alt={bolao.awayTeam.name} />
        <AvatarFallback>{bolao.awayTeam.name.charAt(0)}</AvatarFallback>
      </Avatar>
    </div>
  </div>
);

export const ResultsTicker = () => {
  const [results, setResults] = useState<Bolao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const finishedBoloes = await getFinishedBoloes();
        if (finishedBoloes.length > 0) {
          // Duplica o array para dar a ilusão de um loop infinito e contínuo
          setResults([...finishedBoloes, ...finishedBoloes]); 
        }
      } catch (error) {
        console.error("Failed to fetch results for ticker:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) {
    return <Skeleton className="h-6 w-full max-w-xs" />;
  }

  if (results.length === 0) {
    return null; // Não renderiza nada se não houver resultados
  }

  // Ajusta a duração da animação com base no número de itens
  const animationDuration = results.length * 5; 

  return (
    <>
      <div 
        className="flex items-center h-full"
        style={{ 
          // A animação move o contêiner para a esquerda em 50% de sua largura total.
          // Como o conteúdo está duplicado, isso cria um loop perfeito.
          animation: `ticker ${animationDuration}s linear infinite`,
        }}
      >
        {results.map((bolao, index) => (
           <Fragment key={`${bolao.id}-${index}`}>
            <TickerItem bolao={bolao} />
            {/* Adiciona o separador, exceto após o último item real (antes da duplicação) */}
            {index < (results.length / 2) - 1 && <Separator orientation="vertical" className="h-4 bg-muted-foreground/30" />}
          </Fragment>
        ))}
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </>
  );
};
