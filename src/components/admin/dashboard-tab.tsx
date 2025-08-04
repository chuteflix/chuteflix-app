
"use client";

import { useEffect, useState, ReactNode } from "react";
import {
  getDashboardData,
  DashboardKPIs,
  RecentTransaction,
} from "@/services/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Users,
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  CircleDollarSign,
  Ticket,
  TrendingUp
} from "lucide-react";
import { UserProfile } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const formatCurrency = (value: number) => {
    return (value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
};

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  percentage?: string;
  description?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, percentage, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {percentage && <p className="text-xs text-muted-foreground">{percentage}</p>}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

const SkeletonKpiCard = () => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-3 w-1/3" />
        </CardContent>
    </Card>
);


export function DashboardTab() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getDashboardData();
      setKpis(data.kpis);
      setRecentUsers(data.recentUsers);
      setRecentTransactions(data.recentTransactions);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getTransactionTypeDetails = (type: RecentTransaction['type']) => {
    switch(type) {
      case 'deposit': return { label: 'Depósito', icon: <ArrowUpRight className="h-4 w-4 text-green-500" /> };
      case 'withdrawal': return { label: 'Saque', icon: <ArrowDownLeft className="h-4 w-4 text-red-500" /> };
      case 'bet_placement': return { label: 'Aposta', icon: <Ticket className="h-4 w-4 text-blue-500" /> };
      case 'prize_winning': return { label: 'Prêmio', icon: <CircleDollarSign className="h-4 w-4 text-yellow-500" /> };
      default: return { label: type, icon: <DollarSign className="h-4 w-4 text-muted-foreground"/> };
    }
  }

  if (loading) {
      return (
          <div className="space-y-4">
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <SkeletonKpiCard />
                    <SkeletonKpiCard />
                    <SkeletonKpiCard />
                    <SkeletonKpiCard />
               </div>
               <div className="grid gap-4 md:grid-cols-2">
                    <Card><CardHeader><Skeleton className="h-6 w-1/2"/></CardHeader><CardContent><Skeleton className="h-40 w-full"/></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-1/2"/></CardHeader><CardContent><Skeleton className="h-40 w-full"/></CardContent></Card>
               </div>
          </div>
      )
  }
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Receita Total (Depósitos)"
          value={formatCurrency(kpis?.totalRevenue || 0)}
          icon={<ArrowUpRight className="h-4 w-4 text-green-500" />}
          description="Total de depósitos concluídos."
        />
        <KpiCard
          title="Pagamentos (Saques)"
          value={formatCurrency(kpis?.totalWithdrawals || 0)}
          icon={<ArrowDownLeft className="h-4 w-4 text-red-500" />}
          description="Total de saques concluídos."
        />
        <KpiCard
          title="Total de Usuários"
          value={(kpis?.totalUsersCount || 0).toLocaleString('pt-BR')}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          percentage={`${kpis?.newUsersLast30Days || 0} novos nos últimos 30 dias`}
        />
        <KpiCard
          title="Total de Apostas"
          value={(kpis?.totalBetsCount || 0).toLocaleString('pt-BR')}
          icon={<Ticket className="h-4 w-4 text-muted-foreground" />}
          description={`Ticket Médio: ${formatCurrency(kpis?.averageBetValue || 0)}`}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              As últimas 5 movimentações na plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="font-medium">{tx.user?.name || 'Usuário do Sistema'}</div>
                      <div className="text-sm text-muted-foreground hidden md:block">
                        {tx.user?.email}
                      </div>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      {getTransactionTypeDetails(tx.type).icon}
                      <span>{getTransactionTypeDetails(tx.type).label}</span>
                    </TableCell>
                    <TableCell className="text-right">
                        {formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Novos Usuários</CardTitle>
            <CardDescription>
              Os 5 usuários mais recentes que se cadastraram.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div className="flex items-center" key={user.uid}>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL} alt="Avatar" />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.createdAt ? `Cadastrado em ${format(user.createdAt.toDate(), "dd 'de' MMMM", { locale: ptBR })}` : user.email}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">{formatCurrency(user.balance || 0)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
