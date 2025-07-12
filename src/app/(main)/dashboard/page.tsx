"use client";

import { BolaoCard } from "@/components/bolao-card";
import { myGuesses } from "@/lib/data";

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-primary">Meus Chutes</h1>
        {myGuesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myGuesses.map((bolao) => (
                    <BolaoCard key={bolao.id} bolao={bolao} isAuthenticated={true} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 bg-card rounded-lg mt-6 border">
                <p className="text-muted-foreground">Você ainda não fez nenhum palpite.</p>
            </div>
        )}
    </div>
  );
}
