"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Flag,
  PlusCircle,
  Shield,
  Trophy,
  Users as UsersIcon,
  Pencil,
  Trash2,
  LayoutGrid,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { boloes, championships, teams, users, transactions } from "@/lib/data";
import { BolaoFormModal } from "@/components/bolao-form-modal";

const AdminPage = () => {
  const [isBolaoModalOpen, setIsBolaoModalOpen] = useState(false);
  
  const totalArrecadado = transactions.reduce((acc, t) => t.status === 'Confirmado' ? acc + t.amount : acc, 0);
  const openBoloesCount = boloes.filter(b => b.status === 'Aberto').length;

  return (
    <>
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Painel do Administrador</h1>
        <Button onClick={() => setIsBolaoModalOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Bolão
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="dashboard"><LayoutGrid className="mr-2 h-4 w-4" />Dashboard</TabsTrigger>
          <TabsTrigger value="boloes"><Shield className="mr-2 h-4 w-4" />Bolões</TabsTrigger>
          <TabsTrigger value="campeonatos"><Trophy className="mr-2 h-4 w-4" />Campeonatos</TabsTrigger>
          <TabsTrigger value="times"><Flag className="mr-2 h-4 w-4" />Times</TabsTrigger>
          <TabsTrigger value="usuarios"><UsersIcon className="mr-2 h-4 w-4" />Usuários</TabsTrigger>
          <TabsTrigger value="transacoes"><ArrowRightLeft className="mr-2 h-4 w-4" />Transações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Arrecadado</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalArrecadado.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Soma de todas as transações confirmadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{users.length}</div>
                 <p className="text-xs text-muted-foreground">Total de usuários cadastrados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Bolões</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{boloes.length}</div>
                <p className="text-xs text-muted-foreground">Bolões criados na plataforma</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bolões Abertos</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openBoloesCount}</div>
                <p className="text-xs text-muted-foreground">Bolões aguardando palpites</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="boloes" className="mt-6">
          <div className="bg-card rounded-lg overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partida</TableHead>
                  <TableHead>Campeonato</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boloes.map((bolao) => (
                  <TableRow key={bolao.id}>
                    <TableCell>{bolao.teamA.name} vs {bolao.teamB.name}</TableCell>
                    <TableCell>{bolao.championship}</TableCell>
                    <TableCell>{format(bolao.matchDate, "dd/MM/yy HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell>
                      <Badge variant={bolao.status === "Aberto" ? "success" : "destructive"}>{bolao.status}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="campeonatos" className="mt-6">
           <div className="bg-card rounded-lg overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Escopo</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {championships.map((champ) => (
                  <TableRow key={champ.id}>
                    <TableCell>{champ.name}</TableCell>
                    <TableCell>{champ.scope}</TableCell>
                    <TableCell>{champ.location}</TableCell>
                    <TableCell><Badge variant={champ.level === "Profissional" ? "default" : "secondary"}>{champ.level}</Badge></TableCell>
                    <TableCell className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="times" className="mt-6">
         <div className="bg-card rounded-lg overflow-hidden border">
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>ID</TableHead><TableHead  className="text-right">Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {teams.map(team => (
                  <TableRow key={team.id}><TableCell>{team.name}</TableCell><TableCell>{team.id}</TableCell>
                  <TableCell className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="usuarios" className="mt-6">
          <div className="bg-card rounded-lg overflow-hidden border">
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Desde</TableHead><TableHead  className="text-right">Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}><TableCell>{user.name}</TableCell><TableCell>{user.email}</TableCell><TableCell>{format(user.createdAt, "dd/MM/yyyy")}</TableCell>
                  <TableCell className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="transacoes" className="mt-6">
          <div className="bg-card rounded-lg overflow-hidden border">
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Usuário</TableHead><TableHead>Bolão</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {transactions.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="truncate max-w-[50px]">{t.id}</TableCell>
                    <TableCell>{users.find(u => u.id === t.userId)?.name}</TableCell>
                    <TableCell className="truncate max-w-[50px]">{t.bolaoId}</TableCell>
                    <TableCell>R$ {t.amount.toFixed(2)}</TableCell>
                    <TableCell><Badge variant={t.status === 'Confirmado' ? 'success' : 'secondary'}>{t.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
      </Tabs>
    </div>
    <BolaoFormModal isOpen={isBolaoModalOpen} onClose={() => setIsBolaoModalOpen(false)} />
    </>
  );
};

export default AdminPage;
