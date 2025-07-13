
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
        
        {/* Background video */}
        <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover z-0"
        >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
            Seu navegador não suporta a tag de vídeo.
        </video>

      {/* Content */}
      <div className="relative z-20 p-4 sm:p-6 md:p-8 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
          Bolões, palpites e muita emoção.
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto drop-shadow-md">
          A plataforma definitiva para os amantes de futebol. Participe de bolões, dê seus palpites e concorra a prêmios incríveis.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Button size="lg" asChild>
            <Link href="#boloes" onClick={scrollTo('boloes')}>
              Ver Bolões em Destaque
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-white border-white/80 hover:bg-white/20 hover:text-white transition-colors" 
            asChild
          >
            <Link href="#faq" onClick={scrollTo('faq')}>
              Como Funciona?
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
