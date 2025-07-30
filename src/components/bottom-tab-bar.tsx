"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Ticket,
  Wallet,
  Send,
  BarChart2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const userTabs = [
  { href: "/inicio", icon: Home, label: "Início" },
  { href: "/meus-chutes", icon: Ticket, label: "Meus Chutes" },
  { href: "/recarga", icon: Wallet, label: "Recarga" },
  { href: "/saque", icon: Send, label: "Saque" },
  { href: "/transacoes", icon: BarChart2, label: "Transações" },
]

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg md:hidden">
      <nav className="flex h-16 items-center justify-around">
        {userTabs.map((item) => {
          const isActive = pathname === item.href || (item.href === "/inicio" && pathname === "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
