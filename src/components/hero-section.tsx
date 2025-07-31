
"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowDown } from "lucide-react"

export function HeroSection() {
    
  const scrollTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative w-full h-screen max-h-[1080px] flex items-center justify-center text-center text-white overflow-hidden">
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/60 z-10" />
        
        {/* Video de fundo */}
        <video 
          className="absolute inset-0 w-full h-full object-cover z-0" 
          autoPlay 
          loop 
          muted 
          playsInline
          poster="/placeholder-video-poster.jpg" // Adicionar um poster para quando o vídeo não carregar
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-soccer-game-50796-large.mp4" type="video/mp4" />
          Seu navegador não suporta a tag de vídeo.
        </video>


      {/* Content */}
      <div className="relative z-20 p-4 sm:p-6 md:p-8 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
          ChuteFlix: Onde o Futebol Vira Emoção. Sem Pausas.
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto drop-shadow-md">
          O primeiro streaming de bolões da América Latina. Escolha seu jogo, dê seu palpite e sinta a adrenalina de cada lance como nunca antes.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">
              Começar Agora
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-white border-white/80 hover:bg-white/20 hover:text-white transition-colors" 
            asChild
          >
            <Link href="#boloes" onClick={scrollTo('boloes')}>
              Ver Catálogo de Bolões
            </Link>
          </Button>
        </div>
        
        {/* Animated scroll down indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <Link 
              href="#features" 
              onClick={scrollTo('features')} 
              className="group animate-bounce flex flex-col items-center text-white/80 hover:text-white"
              aria-label="Rolar para a próxima seção"
            >
                <ArrowDown className="h-6 w-6 transition-transform group-hover:translate-y-1" />
            </Link>
        </div>
      </div>
    </section>
  )
}
