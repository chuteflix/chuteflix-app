
"use client"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DollarSign, Users, CreditCard, Activity } from "lucide-react"

const KpiCard = ({ title, icon, children, className = "" }) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
)

const chartData = [
  { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Fev", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Abr", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Mai", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Jul", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Ago", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Set", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Out", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Nov", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Dez", total: Math.floor(Math.random() * 5000) + 1000 },
]

const recentUsers = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    avatar: "/avatars/01.png",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    avatar: "/avatars/02.png",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    avatar: "/avatars/03.png",
  },
]

const recentTransactions = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "R$1,999.00",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "R$39.00",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "R$299.00",
  },
]

export function DashboardTab() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total de Receita"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">R$45.231,89</div>
          <p className="text-xs text-muted-foreground">
            +20.1% do último mês
          </p>
        </KpiCard>
        <KpiCard
          title="Assinaturas"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">+2350</div>
          <p className="text-xs text-muted-foreground">
            +180.1% do último mês
          </p>
        </KpiCard>
        <KpiCard
          title="Vendas"
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">+12234</div>
          <p className="text-xs text-muted-foreground">+19% do último mês</p>
        </KpiCard>
        <KpiCard
          title="Ativos"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="text-2xl font-bold">+573</div>
          <p className="text-xs text-muted-foreground">+20% do último mês</p>
        </KpiCard>
      </div>
      <div className="grid gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={value =>
                    `R$${value.toLocaleString("pt-BR")}`
                  }
                />
                <Tooltip />
                <Bar dataKey="total" fill="#FF8C00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Houveram 26 vendas no último mês.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map(transaction => (
                    <TableRow key={transaction.email}>
                      <TableCell>
                        <div className="font-medium">{transaction.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Usuários Recentes</CardTitle>
              <CardDescription>
                Houveram 5 novos usuários no último mês.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {recentUsers.map(user => (
                  <div className="flex items-center" key={user.email}>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt="Avatar" />
                      <AvatarFallback>
                        {user.name.charAt(0)}
                        {user.name.split(" ")[1]?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
