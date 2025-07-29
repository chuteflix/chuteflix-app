
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
  Send
} from "lucide-react"

import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader
} from "@/components/ui/sidebar"
import { Logo } from "@/components/icons"
import { useAuth } from "@/context/auth-context"

const adminMenu = [
  { href: "/admin", icon: BarChart2, label: "Dashboard" },
  { href: "/admin/usuarios", icon: Users, label: "Usuários" },
  { href: "/admin/times", icon: Flag, label: "Times" },
  { href: "/admin/categorias", icon: List, label: "Categorias" },
  { href: "/admin/boloes", icon: Trophy, label: "Bolões" },
  { href: "/admin/chutes", icon: Ticket, label: "Chutes" },
  { href: "/admin/depositos", icon: CreditCard, label: "Depósitos" },
  { href: "/admin/saques", icon: Send, label: "Saques" },
  { href: "/admin/notificacoes", icon: Bell, label: "Notificações" },
  { href: "/admin/equipe", icon: ShieldCheck, label: "Equipe" },
  { href: "/admin/configuracoes", icon: Settings, label: "Configurações" },
]

const userMenu = [
  { href: "/inicio", icon: Home, label: "Início" },
  { href: "/meus-chutes", icon: Ticket, label: "Meus Chutes" },
  { href: "/recarga", icon: Wallet, label: "Recarga" },
  { href: "/saque", icon: Send, label: "Saque" },
  { href: "/transacoes", icon: BarChart2, label: "Transações" },
  { href: "/profile", icon: User, label: "Meu Perfil" },
]

export function Sidebar({ role }: { role: "admin" | "user" }) {
  const pathname = usePathname()
  const { auth } = useAuth()
  const menu = role === "admin" ? adminMenu : userMenu

  return (
    <SidebarPrimitive className="w-64 border-r bg-card text-card-foreground">
        <SidebarHeader>
            <Logo />
        </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menu.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
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
    </SidebarPrimitive>
  )
}
