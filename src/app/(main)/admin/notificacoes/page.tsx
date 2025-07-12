
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const notifications = [
  {
    title: "Novo usuário registrado",
    description: "João Silva acabou de se registrar.",
    time: "15 minutos atrás",
  },
  {
    title: "Pagamento recebido",
    description: "Maria Souza pagou a inscrição no bolão 'Libertadores'.",
    time: "1 hora atrás",
  },
  {
    title: "Bolão 'Brasileirão' finalizado",
    description: "O bolão do Brasileirão foi finalizado. Verifique os resultados.",
    time: "3 horas atrás",
  },
  {
    title: "Novo login suspeito",
    description: "Um novo login foi detectado de um local incomum.",
    time: "1 dia atrás",
  },
]

export default function NotificacoesPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Notificações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Todas as Notificações</CardTitle>
          <CardDescription>
            Aqui estão todas as suas notificações.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="flex items-start gap-4 rounded-lg border p-4"
            >
              <div className="flex-1">
                <p className="font-semibold">{notification.title}</p>
                <p className="text-sm text-muted-foreground">
                  {notification.description}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{notification.time}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
