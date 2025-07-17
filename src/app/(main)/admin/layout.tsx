
"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

// Este componente é um HOC (Higher-Order Component) para proteger as rotas do admin
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, userRole } = useAuth()
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    // Se não estiver carregando e não houver usuário, redireciona para o login
    if (!loading && !user) {
      router.replace("/login")
      return
    }

    // Se não estiver carregando e o usuário não for admin, redireciona para a home
    if (!loading && user && userRole !== "admin") {
      router.replace("/inicio")
      return
    }

    // Se passou por todas as verificações, permite o acesso
    if (!loading && user && userRole === "admin") {
      setIsVerified(true)
    }
  }, [user, loading, userRole, router])

  // Enquanto verifica, exibe um loader
  if (!isVerified) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Se verificado, renderiza o conteúdo da página do admin
  return <>{children}</>
}
