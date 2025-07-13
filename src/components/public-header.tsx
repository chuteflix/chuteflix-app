
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react"

export function PublicHeader() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [firstName, setFirstName] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const nameFromAuth = user.displayName?.split(" ")[0]
      if (nameFromAuth) {
        setFirstName(nameFromAuth)
      } else {
        const nameFromStorage = localStorage.getItem("userFirstName")
        setFirstName(nameFromStorage)
      }
    }
  }, [user])

  const handleLogout = async () => {
    await auth.signOut()
    localStorage.removeItem("userFirstName")
    router.push("/login")
  }
  
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
        
        {loading ? (
            <div className="w-24 h-8 bg-muted/50 rounded-md animate-pulse" />
        ) : user ? (
            <div className="flex items-center gap-4">
                {firstName && (
                    <span className="hidden sm:inline-block text-sm text-muted-foreground">
                        Olá, <span className="font-semibold text-foreground">{firstName}!</span>
                    </span>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                                <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/inicio">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Meu Painel</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/profile">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Editar Perfil</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sair</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        ) : (
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild>
                    <Link href="/register">Criar Conta</Link>
                </Button>
            </div>
        )}
      </div>
    </header>
  )
}
