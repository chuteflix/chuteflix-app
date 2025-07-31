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
    Settings as SettingsIcon
} from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import { cn } from "@/lib/utils"
import { ResultsTicker } from "./results-ticker"

export function DashboardHeader() {
  const { userProfile, loading, settings } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await auth.signOut()
    router.push('/')
  }
  
  const firstName = userProfile?.name?.split(" ")[0] || "";

  return (
    <header className={cn(
        "fixed top-0 right-0 z-40 transition-colors duration-300 ease-in-out",
        "bg-background shadow-md",
        "w-full md:w-[calc(100vw-16rem)]" // Ocupa a largura total menos a sidebar em desktop
      )}>
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6 h-16">
        
        {/* Left section in Dashboard: Empty or perhaps a minimal toggle (not in scope now) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Logo is in Sidebar for dashboard */}
        </div>
        
        {/* Center Section: Ticker - Hidden on mobile */}
        <div className="hidden md:flex flex-1 justify-center items-center h-full mx-4 relative overflow-hidden">
          {loading ? (
            <Skeleton className="w-full h-8" />
          ) : (
            <>
              <ResultsTicker />
              <div className="absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
              <div className="absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />
            </>
          )}
        </div>
        
        {/* Right Section: User actions */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-auto md:ml-0">
          {loading ? (
              <Skeleton className="w-24 h-8 rounded-md" />
          ) : (
              <>
                  <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <span className="text-sm font-semibold text-foreground">
                          {(userProfile?.balance ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                  </div>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                              <Avatar className="h-9 w-9">
                                  <AvatarImage src={userProfile?.photoURL || ""} alt={userProfile?.name || ""} />
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
          )}
        </div>
      </div>
    </header>
  )
}
