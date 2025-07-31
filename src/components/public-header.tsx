"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
    LayoutDashboard, 
    Wallet, 
    Menu,
    Home,
    Ticket,
    Send,
    BarChart2, 
    Settings as SettingsIcon
} from "lucide-react"
import { Settings } from "@/types"
import { Skeleton } from "./ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"; // Adicionado importação do Separator
import { useState } from "react"

interface PublicHeaderProps {
  showNavLinks?: boolean;
  settings?: Settings | null;
}

const userMenu = [
    { href: "/inicio", icon: Home, label: "Início" },
    { href: "/meus-chutes", icon: Ticket, label: "Meus Chutes" },
    { href: "/recarga", icon: Wallet, label: "Recarga" },
    { href: "/saque", icon: Send, label: "Saque" },
    { href: "/transacoes", icon: BarChart2, label: "Transações" },
];

export function PublicHeader({ showNavLinks = false, settings: propSettings }: PublicHeaderProps) {
  const { userProfile, loading } = useAuth()
  const pathname = usePathname()
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const currentSettings = propSettings || useAuth().settings; 

  const handleLogout = async () => {
    await auth.signOut()
  }
  
  const scrollTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsSheetOpen(false);
    }
  }
  
  const firstName = userProfile?.name?.split(" ")[0] || "";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={userProfile ? "/inicio" : "/"} className="flex items-center gap-2">
            <Logo logoUrl={currentSettings?.logoUrl} />
            <span className="text-xl font-bold hidden sm:inline">{currentSettings?.appName || "ChuteFlix"}</span>
        </Link>
        {showNavLinks && !userProfile && (
          <nav className="hidden md:flex items-center gap-6">
              <Link href="/#features" onClick={scrollTo('features')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Funcionalidades
              </Link>
              <Link href="/#boloes" onClick={scrollTo('boloes')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Bolões
              </Link>
              <Link href="/#faq" onClick={scrollTo('faq')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dúvidas
              </Link>
          </nav>
        )}
        
        {loading ? (
            <Skeleton className="w-24 h-8 rounded-md" />
        ) : userProfile ? (
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                        {(userProfile.balance ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full hidden md:flex">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={userProfile.photoURL || ""} alt={userProfile.name || ""} />
                                <AvatarFallback>{firstName?.charAt(0)?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>{firstName}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Editar Perfil</span>
                            </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                            <Link href="/settings">
                                <SettingsIcon className="mr-2 h-4 w-4" />
                                <span>Chave PIX</span>
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
            <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild>
                    <Link href="/register">Criar Conta</Link>
                </Button>
            </div>
        )}
        <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Abrir menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-sm">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between border-b pb-4">
                           <Link href={userProfile ? "/inicio" : "/"} className="flex items-center gap-2" onClick={() => setIsSheetOpen(false)}> 
                                <Logo logoUrl={currentSettings?.logoUrl} />
                                <span className="text-xl font-bold">{currentSettings?.appName || "ChuteFlix"}</span>
                            </Link>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            {userProfile ? (
                                <nav className="grid gap-4 text-lg font-medium mt-6">
                                    <div className="px-4 py-2 rounded-lg bg-muted">
                                        <div className="text-sm font-medium text-muted-foreground">Saldo Disponível</div>
                                        <div className="text-2xl font-bold">
                                            {(userProfile.balance ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                    </div>
                                    {userMenu.map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted ${pathname === item.href ? 'bg-muted text-primary' : 'text-muted-foreground'}`}
                                            onClick={() => setIsSheetOpen(false)}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>
                            ) : (
                                <>
                                {showNavLinks && (
                                    <nav className="grid gap-6 text-lg font-medium mt-10">
                                        <Link href="/#features" onClick={scrollTo('features')} className="text-muted-foreground hover:text-foreground">Funcionalidades</Link>
                                        <Link href="/#boloes" onClick={scrollTo('boloes')} className="text-muted-foreground hover:text-foreground">Bolões</Link>
                                        <Link href="/#faq" onClick={scrollTo('faq')} className="text-muted-foreground hover:text-foreground">Dúvidas</Link>
                                        <Separator /> {/* Este Separator estava faltando import */}
                                    </nav>
                                )}
                                </>
                            )}
                        </div>
                        <div className="border-t mt-auto pt-4">
                            {userProfile ? (
                                <div className="space-y-2">
                                     <Link href="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsSheetOpen(false)}> 
                                        <UserIcon className="h-5 w-5" />
                                        Editar Perfil
                                     </Link>
                                     <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted" onClick={() => setIsSheetOpen(false)}> 
                                        <SettingsIcon className="h-5 w-5" />
                                        Chave PIX
                                     </Link>
                                     <Separator />
                                     <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10">
                                        <LogOut className="mr-3 h-5 w-5" />
                                        Sair
                                     </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <Button variant="outline" asChild><Link href="/login" onClick={() => setIsSheetOpen(false)}>Entrar</Link></Button>
                                    <Button asChild><Link href="/register" onClick={() => setIsSheetOpen(false)}>Criar Conta</Link></Button>
                                </div>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  )
}
