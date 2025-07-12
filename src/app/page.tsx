import Link from 'next/link';
import { BolaoCard } from "@/components/bolao-card";
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { boloes } from "@/lib/data";
import type { Bolao } from "@/types";

export default function HomePage() {
  const activeBoloes = boloes.filter(b => new Date() < b.matchDate && b.status === 'Aberto');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Logo />
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
             <Button asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/register">Cadastro</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary sm:text-4xl md:text-5xl">Bem-vindo ao ChuteFlix!</h1>
            <p className="mt-4 text-muted-foreground sm:text-xl">Sua plataforma de bolão em um só lugar. Confira os jogos em aberto e faça seu palpite!</p>
          </div>

          <h2 className="text-2xl font-semibold mb-6 text-foreground text-center">Bolões em Aberto</h2>
          {activeBoloes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeBoloes.map((bolao: Bolao) => (
                <BolaoCard key={bolao.id} bolao={bolao} isAuthenticated={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-lg border">
              <p className="text-muted-foreground">Nenhum bolão aberto no momento. Volte mais tarde!</p>
            </div>
          )}
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} ChuteFlix. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
