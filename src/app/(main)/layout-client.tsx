
"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuth } from "@/context/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth()
  const pathname = usePathname()

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center justify-between h-16 px-6 border-b">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </header>
        <div className="flex flex-1">
          <aside className="hidden md:flex flex-col w-64 p-4 border-r">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-4" />
          </aside>
          <main className="flex-1 p-8">
            <Skeleton className="h-full w-full" />
          </main>
        </div>
      </div>
    )
  }

  const userRole = userProfile?.role || "user"
  const isAdminPath = pathname.startsWith("/admin")

  // Se for uma rota de admin, deixa o AdminLayout cuidar da renderização
  if (isAdminPath) {
    return <>{children}</>
  }

  // Caso contrário, renderiza o layout do usuário
  return (
    <div className="flex min-h-screen">
      <Sidebar role={userRole} />
      <main className="flex-1 flex flex-col">
        <DashboardHeader isAdminSection={false} />
        <div className="flex-1 p-4 md:p-8 pt-20">{children}</div>
      </main>
    </div>
  )
}
