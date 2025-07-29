
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  Flag,
  Trophy,
  Ticket,
  Settings,
  ShieldCheck,
  User,
  Wallet,
  LogOut,
  Bell,
  BarChart2,
  List,
  CreditCard,
  Send,
  MoreHorizontal
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar"
import { Logo } from "@/components/icons"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"

const adminMenu = [
  { href: "/admin", icon: BarChart2, label: "Dashboard" },
  { href: "/admin/usuarios", icon: Users, label: "Usuários" },
  { href: "/admin/times", icon: Flag, label: "Times" },
  { href: "/admin/categorias", icon: List, label: "Categorias" },
  { href: "/admin/boloes", icon: Trophy, label: "Bolões" },
  { href: "/admin/chutes", icon: Ticket, label: "Chutes" },
  { href: "/admin/depositos", icon: CreditCard, label: "Depósitos" },
  { href: "/admin/saques", icon: Send, label: "Saques" },
  // { href: "/admin/notificacoes", icon: Bell, label: "Notificações" },
  { href: "/admin/equipe", icon: ShieldCheck, label: "Equipe" },
  { href: "/admin/configuracoes", icon: Settings, label: "Configurações" },
]

const userMenu = [
  { href: "/inicio", icon: Home, label: "Início" },
  { href: "/meus-chutes", icon: Ticket, label: "Meus Chutes" },
  { href: "/recarga", icon: Wallet, label: "Recarga" },
  { href: "/saque", icon: Send, label: "Saque" },
  { href: "/transacoes", icon: BarChart2, label: "Transações" },
]

export function Sidebar({ role }: { role: "admin" | "user" }) {
  const pathname = usePathname()
  const { userProfile, loading, auth } = useAuth()
  const menu = role === "admin" ? adminMenu : userMenu
  
  const handleLogout = async () => {
    await auth.signOut();
  }
  
  const firstName = userProfile?.name?.split(" ")[0] || "";

  return (
    <SidebarPrimitive className="w-64 border-r bg-card text-card-foreground">
        <SidebarHeader className="border-b">
            <Link href={role === 'admin' ? '/admin' : '/inicio'}>
                <Logo />
            </Link>
        </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          {menu.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin')}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        {loading ? (
            <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        ) : userProfile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start items-center gap-3 h-auto p-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={userProfile.photoURL || ""} alt={userProfile.name || ""} />
                        <AvatarFallback>{firstName?.charAt(0)?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-semibold truncate">{userProfile.name}</p>
                        <p className="text-xs text-muted-foreground">{role === 'admin' ? 'Administrador' : 'Usuário'}</p>
                    </div>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" side="top">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile"><User className="mr-2 h-4 w-4" /> Editar Perfil</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Chave PIX</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </SidebarFooter>
    </SidebarPrimitive>
  )
}
