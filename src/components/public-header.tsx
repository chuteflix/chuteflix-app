"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
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
    Settings as SettingsIcon,
    Menu,
    Loader2
} from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import { cn } from "@/lib/utils"
import { ResultsTicker } from "./results-ticker"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Settings } from "@/types"

interface PublicHeaderProps {
  settings: Settings | null;
}

export function PublicHeader({ settings: initialSettings }: PublicHeaderProps) {
  const { userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [settings, setSettings] = useState(initialSettings);
  const [settingsLoading, setSettingsLoading] = useState(!initialSettings);

  useEffect(() => {
    if (!initialSettings) {
      import('@/services/settings').then(module => {
        module.getSettings().then(s => {
          setSettings(s);
          setSettingsLoading(false);
        });
      });
    }
  }, [initialSettings]);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    await auth.signOut()
    router.push('/')
  }
  
  const firstName = userProfile?.name?.split(" ")[0] || "";
  const isDashboard = !!userProfile;

  const scrollTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -80; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
      setIsSheetOpen(false);
    }
  }

  const isLoading = authLoading || settingsLoading;

  // Não renderiza o header em rotas de dashboard
  const pathname = usePathname();
  if (isDashboard && pathname !== '/') {
    return null;
  }

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled ? "bg-background/80 backdrop-blur-sm shadow-md" : "bg-transparent"
      )}>
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6 h-16">
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {isLoading ? (
             <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-6 w-24 hidden sm:block" />
             </div>
          ) : (
            <Link href={isDashboard ? "/inicio" : "/"} className="flex items-center gap-2">
                <Logo logoUrl={settings?.logoUrl} />
                <span className="hidden sm:inline text-xl font-bold">{settings?.appName || "ChuteFlix"}</span>
            </Link>
          )}
        </div>
        
        <nav className="hidden md:flex items-center gap-2 lg:gap-4">
            <Button variant="ghost" asChild><Link href="/#features" onClick={scrollTo('features')}>Funcionalidades</Link></Button>
            <Button variant="ghost" asChild><Link href="/#boloes" onClick={scrollTo('boloes')}>Bolões</Link></Button>
            <Button variant="ghost" asChild><Link href="/#faq" onClick={scrollTo('faq')}>Dúvidas</Link></Button>
        </nav>
        
        <div className="flex items-center gap-4 flex-shrink-0">
          {isLoading ? (
              <Skeleton className="w-24 h-8 rounded-md" />
          ) : isDashboard ? (
              <div className="hidden"></div>
          ) : (
              <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" asChild><Link href="/login">Entrar</Link></Button>
                  <Button asChild className="font-semibold transition-transform hover:scale-105"><Link href="/register">Criar Conta Grátis</Link></Button>
              </div>
          )}
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between border-b pb-4">
                       <Link href={"/"} className="flex items-center gap-2" onClick={() => setIsSheetOpen(false)}> 
                            <Logo logoUrl={settings?.logoUrl} />
                            <span className="text-xl font-bold">{settings?.appName || "ChuteFlix"}</span>
                        </Link>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        <nav className="grid gap-6 text-lg font-medium mt-10">
                            <Link href="/#features" onClick={scrollTo('features')} className="text-muted-foreground hover:text-foreground">Funcionalidades</Link>
                            <Link href="/#boloes" onClick={scrollTo('boloes')} className="text-muted-foreground hover:text-foreground">Bolões</Link>
                            <Link href="/#faq" onClick={scrollTo('faq')}>Dúvidas</Link>
                        </nav>
                    </div>
                    <div className="border-t mt-auto pt-4">
                        <div className="flex flex-col gap-4">
                            <Button variant="outline" asChild><Link href="/login" onClick={() => setIsSheetOpen(false)}>Entrar</Link></Button>
                            <Button asChild><Link href="/register" onClick={() => setIsSheetOpen(false)}>Criar Conta Grátis</Link></Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
