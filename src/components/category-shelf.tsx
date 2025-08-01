"use client";

import { useState, useEffect, useMemo } from "react";
import { Bolao, getBoloesByCategoryId } from "@/services/boloes";
import { Category } from "@/services/categories";
import { BoloesCarousel } from "@/components/boloes-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryShelfProps {
  category: Category;
}

type FilterType = 'all' | 'national' | 'international';

export function CategoryShelf({ category }: CategoryShelfProps) {
  const [boloes, setBoloes] = useState<Bolao[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    const fetchBoloes = async () => {
      setLoading(true);
      try {
        const fetchedBoloes = await getBoloesByCategoryId(category.id);
        // Adicionando uma propriedade 'type' para simulação, se não existir
        const boloesWithType = fetchedBoloes.map(b => ({
          ...b,
          // Simulação: se o campeonato incluir 'Brasil', é nacional.
          type: b.championship && b.championship.toLowerCase().includes('brasil') ? 'national' : 'international'
        }));
        setBoloes(boloesWithType);
      } catch (error) {
        console.error(`Erro ao buscar bolões para a categoria ${category.name}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoloes();
  }, [category]);

  const filteredBoloes = useMemo(() => {
    if (activeFilter === 'all') {
      return boloes;
    }
    return boloes.filter(bolao => bolao.type === activeFilter);
  }, [boloes, activeFilter]);

  if (loading) {
    return (
      <div className="mb-8">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="flex space-x-4 overflow-hidden">
          <Skeleton className="min-w-[280px] h-96 rounded-lg flex-shrink-0" />
          <Skeleton className="min-w-[280px] h-96 rounded-lg flex-shrink-0" />
          <Skeleton className="min-w-[280px] h-96 rounded-lg flex-shrink-0" />
        </div>
      </div>
    );
  }

  if (boloes.length === 0) {
    return null;
  }

  const filters: { label: string; value: FilterType }[] = [
    { label: "Todos", value: 'all' },
    { label: "Nacionais", value: 'national' },
    { label: "Internacionais", value: 'international' },
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2 sm:mb-0">{category.name}</h2>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-full">
          {filters.map(filter => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(filter.value)}
              className="rounded-full transition-colors duration-200"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
      
      {filteredBoloes.length > 0 ? (
        <BoloesCarousel boloes={filteredBoloes} />
      ) : (
        <div className="text-center bg-muted/20 border-2 border-dashed border-border/30 rounded-lg py-12 mt-4">
            <h3 className="text-xl font-bold">Nenhum bolão encontrado</h3>
            <p className="text-muted-foreground mt-1">Tente um filtro diferente ou volte mais tarde.</p>
        </div>
      )}
    </div>
  );
}
