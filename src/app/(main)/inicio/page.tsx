"use client";

import { useState, useEffect } from "react";
import { getAllCategories, Category } from "@/services/categories";
import { CategoryShelf } from "@/components/category-shelf";
import { WelcomeBanner } from "@/components/welcome-banner";
import { Skeleton } from "@/components/ui/skeleton";

export default function InicioPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Falha ao buscar categorias:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <WelcomeBanner />
        {/* Skeleton para as prateleiras */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-8 w-1/3 mb-4" />
            <div className="flex space-x-4">
                <Skeleton className="h-48 w-64 rounded-lg" />
                <Skeleton className="h-48 w-64 rounded-lg" />
                <Skeleton className="h-48 w-64 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <WelcomeBanner />

      {categories.map((category) => (
        <CategoryShelf key={category.id} category={category} />
      ))}

      {categories.length === 0 && !loading && (
        <div className="text-center bg-muted/20 border-2 border-dashed border-border/30 rounded-lg py-20 col-span-full">
          <h3 className="text-2xl font-bold">
            Nenhuma categoria de bolão disponível no momento.
          </h3>
          <p className="text-muted-foreground mt-2">
            Volte em breve ou peça para um administrador configurar as categorias.
          </p>
        </div>
      )}
    </div>
  );
}
