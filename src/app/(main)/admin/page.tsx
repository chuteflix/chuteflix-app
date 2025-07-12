
"use client"

import { DashboardTab } from "@/components/admin/dashboard-tab"

export default function AdminPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Painel do Administrador
      </h1>
      <DashboardTab />
    </div>
  )
}
