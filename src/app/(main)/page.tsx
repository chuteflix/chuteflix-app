import { BolaoCard } from "@/components/bolao-card";
import { boloes } from "@/lib/data";
import type { Bolao } from "@/types";

export default function HomePage() {
  const activeBoloes = boloes.filter(b => new Date() < b.matchDate && b.status === 'Aberto');

  return (
    <div className="container mx-auto">
       <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Bem-vindo ao ChuteFlix!</h1>
        <p className="text-muted-foreground">Sua plataforma de bolão em um só lugar. Confira os jogos em aberto e faça seu palpite!</p>
      </div>

      <h2 className="text-2xl font-semibold mb-6 text-foreground">Bolões em Aberto</h2>
      {activeBoloes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeBoloes.map((bolao: Bolao) => (
            <BolaoCard key={bolao.id} bolao={bolao} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg border">
          <p className="text-muted-foreground">Nenhum bolão aberto no momento. Volte mais tarde!</p>
        </div>
      )}
    </div>
  );
}
