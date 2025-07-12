"use client";

import { BolaoCard } from "@/components/bolao-card";
import { myGuesses } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-50">Meus Chutes</h1>
        <Button asChild className="bg-green-500 text-black font-bold hover:bg-green-600">
          <Link href="/">
            <PlusCircle className="mr-2 h-5 w-5" />
            Ver Novos Bolões
          </Link>
        </Button>
      </div>

      {myGuesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {myGuesses.map((bolao) => (
                  <BolaoCard key={bolao.id} bolao={bolao} isAuthenticated={true} />
              ))}
          </div>
      ) : (
          <div className="text-center py-20 bg-gray-900 rounded-lg border-2 border-dashed border-gray-800">
              <p className="text-xl font-semibold text-gray-400">Você ainda não fez nenhum palpite.</p>
              <p className="mt-2 text-gray-500">Que tal começar agora?</p>
              <Button asChild className="mt-6 bg-green-500 text-black font-bold hover:bg-green-600">
                <Link href="/">
                    Ver Bolões em Aberto
                </Link>
              </Button>
          </div>
      )}
    </div>
  );
}
