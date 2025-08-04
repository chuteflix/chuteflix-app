
"use client"

import { useAuth } from "@/context/auth-context"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && userProfile?.role !== "admin") {
      router.push("/login")
    }
  }, [userProfile, loading, router])

  if (loading || userProfile?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando ou redirecionando...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 flex flex-col">
        <DashboardHeader isAdminSection={true} />
        <div className="flex-1 p-8 pt-20 bg-muted/20">{children}</div>
      </main>
    </div>
  )
}
