"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { auth } from "@/lib/firebase"
import { Logo } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
    LogOut, 
    User as UserIcon, 
    Wallet,
    Settings as SettingsIcon
} from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import { cn } from "@/lib/utils"
import { ResultsTicker } from "./results-ticker"

interface PublicHeaderProps {
  showNavLinks?: boolean;
}

export function PublicHeader({ showNavLinks = false }: PublicHeaderProps) {
  const { userProfile, loading, settings } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
  };
  
  const firstName = userProfile?.name?.split(" ")[0] || "";
  const isDashboard = !!userProfile;

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out",
        // Em dashboard, o fundo é sólido. Na landing, é transparente até o scroll.
        isDashboard ? "bg-background shadow-md" : (isScrolled ? "bg-background/80 backdrop-blur-sm shadow-md" : "bg-transparent"),
        // A sidebar "empurra" o header no desktop
        isDashboard && "md:left-64"
      )}>
      <div className={cn("flex items-center justify-between px-4 md:px-6 h-16")}>
        
        <div className="flex items-center gap-4">
          {/* O logo só aparece aqui se não estivermos no dashboard (ex: landing, /terms) */}
          {!isDashboard && (
             <Link href="/" className="flex items-center gap-2">
                <Logo logoUrl={settings?.logoUrl} />
                <span className="hidden sm:inline text-xl font-bold">{settings?.appName || "ChuteFlix"}</span>
            </Link>
          )}
        </div>
        
        <div className="flex-1 hidden md:flex justify-center items-center h-full mx-4 overflow-hidden">
          {isDashboard ? (
            <ResultsTicker />
          ) : showNavLinks ? (
            <nav className="flex items-center gap-2 lg:gap-4">
                <Button variant="ghost" asChild><Link href="/#features">Funcionalidades</Link></Button>
                <Button variant="ghost" asChild><Link href="/#boloes">Bolões</Link></Button>
                <Button variant="ghost" asChild><Link href="/#faq">Dúvidas</Link></Button>
            </nav>
          ) : null}
        </div>
        
        <div className="flex items-center gap-4">
          {loading ? (
              <Skeleton className="w-32 h-9 rounded-md" />
          ) : isDashboard ? (
              <>
                  <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <span className="text-sm font-semibold text-foreground">
                          {(userProfile.balance ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                  </div>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                              <Avatar className="h-9 w-9">
                                  <AvatarImage src={userProfile.photoURL || ""} alt={userProfile.name || ""} />
                                  <AvatarFallback>{firstName?.charAt(0)?.toUpperCase()}</AvatarFallback>
                              </Avatar>
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>{firstName}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild><Link href="/profile"><UserIcon className="mr-2 h-4 w-4" /><span>Editar Perfil</span></Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href="/settings"><SettingsIcon className="mr-2 h-4 w-4" /><span>Chave PIX</span></Link></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500"><LogOut className="mr-2 h-4 w-4" /><span>Sair</span></DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </>
          ) : (
              <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" asChild><Link href="/login">Entrar</Link></Button>
                  <Button asChild className="font-semibold transition-transform hover:scale-105"><Link href="/register">Criar Conta Grátis</Link></Button>
              </div>
          )}
        </div>
      </div>
    </header>
  )
}
