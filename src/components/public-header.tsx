
"use client"

import Link from "next/link"
import { Logo } from "@/components/icons"
import { Button } from "@/components/ui/button"

export function PublicHeader() {
  const scrollTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-xl font-bold">ChuteFlix</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" onClick={scrollTo('features')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Funcionalidades
            </Link>
            <Link href="#boloes" onClick={scrollTo('boloes')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Bolões
            </Link>
            <Link href="#faq" onClick={scrollTo('faq')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dúvidas
            </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Criar Conta</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
