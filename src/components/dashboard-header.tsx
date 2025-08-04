"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
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
  User as UserIcon,
  Wallet,
  Settings as SettingsIcon,
  Menu,
  X
} from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import { cn } from "@/lib/utils"
import { ResultsTicker } from "./results-ticker"
import { usePathname } from "next/navigation"

export function DashboardHeader({ isAdminSection }: { isAdminSection: boolean }) {
  const { userProfile, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname();

  const firstName = userProfile?.displayName?.split(" ")[0] || ""

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ease-in-out md:left-64",
          "bg-background/80 backdrop-blur-sm shadow-sm",
          "w-full "
        )}
      >
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6 h-16">
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>

          <div className="hidden md:flex flex-1 justify-center items-center h-full mx-4 relative overflow-hidden">
            {!isAdminSection && !loading && (
              <>
                <ResultsTicker />
                <div className="absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background/80 to-transparent" />
                <div className="absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background/80 to-transparent" />
              </>
            )}
            {loading && !isAdminSection && <Skeleton className="w-full h-8" />}
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {loading ? (
              <Skeleton className="w-24 h-8 rounded-md" />
            ) : (
              userProfile && (
                <>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      {(userProfile.balance ?? 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={userProfile.photoURL || ""}
                            alt={userProfile.displayName || ""}
                          />
                          <AvatarFallback>
                            {firstName?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )
            )}
          </div>
        </div>
      </header>
    </>
  )
}
