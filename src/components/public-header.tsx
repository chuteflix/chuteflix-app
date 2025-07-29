
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
import { LogOut, User as UserIcon, LayoutDashboard, Wallet, Menu } from "lucide-react"
import { Settings } from "@/types"
import { Skeleton } from "./ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

// O cabeçalho agora recebe as configurações como uma propriedade.
export function PublicHeader({ settings }: { settings: Settings | null }) {
  const { userProfile, loading } = useAuth()

  const handleLogout = async () => {
    await auth.signOut()
    // A página irá recarregar ou o AuthProvider irá redirecionar
  }
  
  const scrollTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  const firstName = userProfile?.name?.split(" ")[0] || "";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
            <Logo logoUrl={settings?.logoUrl} />
            <span className="text-xl font-bold hidden sm:inline">{settings?.appName || "ChuteFlix"}</span>
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
        
        {/* O carregamento agora é apenas para os dados do usuário */}
        {loading ? (
            <Skeleton className="w-24 h-8 rounded-md" />
        ) : userProfile ? (
            <div className="flex items-center gap-4">
                {userProfile.balance !== null && (
                    <div className="hidden sm:flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                            {(userProfile.balance ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                )}
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
            <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild>
                    <Link href="/register">Criar Conta</Link>
                </Button>
            </div>
        )}
         <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right">
                 <nav className="grid gap-6 text-lg font-medium mt-10">
                    <Link href="#features" onClick={scrollTo('features')} className="text-muted-foreground hover:text-foreground">Funcionalidades</Link>
                    <Link href="#boloes" onClick={scrollTo('boloes')} className="text-muted-foreground hover:text-foreground">Bolões</Link>
                    <Link href="#faq" onClick={scrollTo('faq')} className="text-muted-foreground hover:text-foreground">Dúvidas</Link>
                    <Separator />
                     {!loading && !userProfile && (
                        <>
                            <Button variant="ghost" asChild><Link href="/login">Entrar</Link></Button>
                            <Button asChild><Link href="/register">Criar Conta</Link></Button>
                        </>
                    )}
                 </nav>
            </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
