
"use client"

const AdminPlaceholder = ({ title }: { title: string }) => (
  <div className="flex h-96 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="text-muted-foreground">Em construção...</p>
    </div>
  </div>
)

export default function ConfiguracoesPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Configurações Gerais
      </h1>
      <AdminPlaceholder title="Configurações Gerais" />
    </div>
  )
}
