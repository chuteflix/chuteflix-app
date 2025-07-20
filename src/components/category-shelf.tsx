"use client";

import { useState, useEffect } from "react";
import { Bolao, getBoloesByCategoryId } from "@/services/boloes";
import { Category } from "@/services/categories";
import { BoloesCarousel } from "@/components/boloes-carousel";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryShelfProps {
  category: Category;
}

export function CategoryShelf({ category }: CategoryShelfProps) {
  const [boloes, setBoloes] = useState<Bolao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoloes = async () => {
      setLoading(true);
      try {
        const fetchedBoloes = await getBoloesByCategoryId(category.id);
        setBoloes(fetchedBoloes);
      } catch (error) {
        console.error(`Erro ao buscar bolões para a categoria ${category.name}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoloes();
  }, [category]);

  if (loading) {
    return (
      <div className="mb-8">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="flex space-x-4">
          <Skeleton className="h-48 w-64 rounded-lg" />
          <Skeleton className="h-48 w-64 rounded-lg" />
          <Skeleton className="h-48 w-64 rounded-lg" />
        </div>
      </div>
    );
  }
  
  // Só renderiza a prateleira se houver bolões nela
  if (boloes.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-foreground">{category.name}</h2>
      <BoloesCarousel boloes={boloes} />
    </div>
  );
}
