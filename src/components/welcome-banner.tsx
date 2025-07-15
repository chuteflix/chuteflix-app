
"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Wallet, DollarSign, Send } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function WelcomeBanner() {
  const { userProfile, loading } = useAuth();

  // Programação defensiva final
  if (loading || !userProfile) {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-28" />
            </div>
        </div>
        <div className="p-6 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                </div>
            </div>
        </div>
      </div>
    );
  }
  
  // Acessa o nome de forma segura
  const firstName = userProfile.name ? userProfile.name.split(" ")[0] : "Usuário";
  const balance = userProfile.balance ?? 0;

  return (
    <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Olá, {firstName}!
                </h1>
                <p className="text-muted-foreground">Bem-vindo(a) de volta ao seu painel.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                    <Link href="/saque">
                        <Send className="mr-2 h-4 w-4" />
                        Sacar
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/recarga">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Depositar
                    </Link>
                </Button>
            </div>
        </div>
        
        <div className="p-6 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-4">
                <Wallet className="h-8 w-8 text-primary" />
                <div>
                    <p className="text-sm text-muted-foreground">Saldo disponível</p>
                    <p className="text-3xl font-bold text-foreground">
                        {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}
