"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Logo } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Bell,
  Home,
  Users,
  Trophy,
  BarChart3,
  Settings,
  Shield,
  Palette,
  ClipboardList,
  Ticket,
  Wallet,
  Send,
  User as UserIcon,
  LogOut,
  ArrowLeftRight,
  HandCoins,
  DollarSign
} from "lucide-react"

const adminMenu = [
  { href: "/admin", icon: Home, label: "Dashboard" },
  { href: "/admin/boloes", icon: Trophy, label: "Bolões" },
  { href: "/admin/chutes", icon: ClipboardList, label: "Chutes" },
  { href: "/admin/depositos", icon: HandCoins, label: "Depósitos" },
  { href: "/admin/saques", icon: DollarSign, label: "Saques" },
  { href: "/admin/usuarios", icon: Users, label: "Usuários" },
  { href: "/admin/times", icon: Shield, label: "Times" },
  { href: "/admin/categorias", icon: Palette, label: "Categorias" },
  { href: "/admin/transacoes", icon: ArrowLeftRight, label: "Transações" },
  { href: "/admin/configuracoes", icon: Settings, label: "Configurações do App" },
];

const userMenu = [
  { href: "/inicio", icon: Home, label: "Início" },
  { href: "/meus-chutes", icon: Ticket, label: "Meus Chutes" },
  { href: "/recarga", icon: Wallet, label: "Recarga" },
  { href: "/saque", icon: Send, label: "Saque" },
  { href: "/transacoes", icon: BarChart3, label: "Minhas Transações" },
];

function MenuLink({ href, icon: Icon, label, currentPath }: { href: string, icon: React.ElementType, label: string, currentPath: string }) {
  const isActive = currentPath === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function Sidebar({ role }: { role: 'admin' | 'user' }) {
  const pathname = usePathname();
  const { userProfile, settings } = useAuth();
  const menuItems = role === 'admin' ? adminMenu : userMenu;

  return (
    <aside className="hidden md:flex flex-col h-full w-64 border-r bg-background">
      <div className="flex items-center justify-center h-16 border-b px-4">
        <Link href={role === 'admin' ? '/admin' : '/inicio'} className="flex items-center gap-2 font-semibold">
          <Logo logoUrl={settings?.logoUrl} />
          <span className="text-lg">{settings?.appName || 'ChuteFlix'}</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="grid items-start gap-1 text-sm font-medium">
          {menuItems.map((item) => (
            <MenuLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              currentPath={pathname}
            />
          ))}
        </div>
      </nav>
      {userProfile && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <UserIcon className="h-8 w-8 rounded-full bg-muted text-muted-foreground p-1.5" />
            <div>
              <p className="text-sm font-semibold">{userProfile.name}</p>
              <p className="text-xs text-muted-foreground">{userProfile.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
