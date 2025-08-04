"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Coins, Send } from "lucide-react";

export function WelcomeBanner() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-muted/20 border-2 border-dashed border-border/30 rounded-lg p-8 flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-12 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 border-2 border-dashed border-border/30 rounded-lg p-8 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Olá, {user?.displayName}!</h2>
        <p className="text-muted-foreground">
          Bem-vindo(a) de volta ao seu painel.
        </p>
        <div className="mt-4">
          <span className="text-sm text-muted-foreground">
            Saldo disponível
          </span>
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(user?.balance || 0)}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="outline" asChild>
          <Link href="/saque">
            <Send className="mr-2 h-4 w-4" />
            Sacar
          </Link>
        </Button>
        <Button asChild>
          <Link href="/recarga">
            <Coins className="mr-2 h-4 w-4" />
            Depositar
          </Link>
        </Button>
      </div>
    </div>
  );
}
