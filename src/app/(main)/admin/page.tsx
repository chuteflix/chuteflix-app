"use client";

import React from "react";
import { useState, useMemo } from "react";
import { useSearchParams } from 'next/navigation';
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
  Settings as SettingsIcon,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { boloes, championships, teams, users, transactions as initialTransactions, settings, updateSettings } from "@/lib/data";
import { BolaoFormModal } from "@/components/bolao-form-modal";
import { ChampionshipFormModal } from "@/components/championship-form-modal";
import { TeamFormModal } from "@/components/team-form-modal";
import type { Settings, Transaction } from "@/types";

const AdminPage = () => {
  const [isBolaoModalOpen, setIsBolaoModalOpen] = useState(false);
  const [isChampionshipModalOpen, setIsChampionshipModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const activeTab = useMemo(() => searchParams.get('tab') || 'dashboard', [searchParams]);

  const totalArrecadado = transactions.reduce((acc, t) => t.status === 'Confirmado' ? acc + t.amount : acc, 0);
  const openBoloesCount = boloes.filter(b => b.status === 'Aberto').length;

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(currentSettings);
    toast({
      title: "Configurações Salvas!",
      description: "As configurações de pagamento foram atualizadas.",
    });
  };

  const handleTransactionStatusChange = (transactionId: string, status: 'Confirmado' | 'Falhou') => {
    setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status } : t));
    toast({
      title: "Transação Atualizada!",
      description: `A transação foi marcada como ${status.toLowerCase()}.`,
      variant: status === "Confirmado" ? "success" : "destructive"
    });
  };

  const getTransactionStatusVariant = (status: Transaction['status']) => {
    switch (status) {
      case 'Confirmado': return 'success';
      case 'Pendente': return 'secondary';
      case 'Falhou': return 'destructive';
      default: return 'secondary';
    }
  }

  const renderHeaderButton = () => {
    switch(activeTab) {
      case 'boloes':
        return (
          <Button onClick={() => setIsBolaoModalOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Bolão
          </Button>
        );
      case 'campeonatos':
         return (
          <Button onClick={() => setIsChampionshipModalOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Campeonato
          </Button>
        );
      case 'times':
        return (
          <Button onClick={() => setIsTeamModalOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Time
          </Button>
        );
      default:
        return null;
    }
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
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
        );
      case 'boloes':
        return (
          <div className="bg-card rounded-lg overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partida</TableHead>
                  <TableHead>Campeonato</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boloes.map((bolao) => (
                  <TableRow key={bolao.id}>
                    <TableCell>{bolao.teamA.name} vs {bolao.teamB.name}</TableCell>
                    <TableCell>{bolao.championship}</TableCell>
                    <TableCell>{format(bolao.matchStartDate, "dd/MM/yy HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell>{format(bolao.matchEndDate, "dd/MM/yy HH:mm", { locale: ptBR })}</TableCell>
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
        );
      case 'campeonatos':
         return (
           <div className="bg-card rounded-lg overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {championships.map((champ) => (
                  <TableRow key={champ.id}>
                    <TableCell>{champ.name}</TableCell>
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
        );
      case 'times':
        return (
         <div className="bg-card rounded-lg overflow-hidden border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Projeção</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map(team => (
                  <TableRow key={team.id}>
                    <TableCell>{team.name}</TableCell>
                    <TableCell><Badge variant={team.level === "Profissional" ? "default" : "secondary"}>{team.level}</Badge></TableCell>
                    <TableCell>{team.location}</TableCell>
                    <TableCell>{team.scope}</TableCell>
                    <TableCell className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      case 'usuarios':
        return (
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
        );
      case 'transacoes':
        return (
          <div className="bg-card rounded-lg overflow-hidden border">
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Usuário</TableHead><TableHead>Bolão</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {transactions.map(t => (
                  <TableRow key={t.id} className={t.status !== 'Pendente' ? 'opacity-60' : ''}>
                    <TableCell className="truncate max-w-[50px]">{t.id}</TableCell>
                    <TableCell>{users.find(u => u.id === t.userId)?.name}</TableCell>
                    <TableCell className="truncate max-w-[50px]">{t.bolaoId}</TableCell>
                    <TableCell>R$ {t.amount.toFixed(2)}</TableCell>
                    <TableCell><Badge variant={getTransactionStatusVariant(t.status)}>{t.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      {t.status === 'Pendente' && (
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon" title="Aprovar" onClick={() => handleTransactionStatusChange(t.id, 'Confirmado')}>
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Recusar" onClick={() => handleTransactionStatusChange(t.id, 'Falhou')}>
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      case 'configuracoes':
        return (
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Pagamento</CardTitle>
                <CardDescription>
                  Altere os dados de pagamento que serão exibidos aos usuários no momento da aposta.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSettingsSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pixKey">Chave PIX</Label>
                    <Input id="pixKey" name="pixKey" value={currentSettings.pixKey} onChange={handleSettingsChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qrCodeUrl">URL do QR Code</Label>
                    <Input id="qrCodeUrl" name="qrCodeUrl" value={currentSettings.qrCodeUrl} onChange={handleSettingsChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">Número do WhatsApp para Comprovante</Label>
                    <Input id="whatsappNumber" name="whatsappNumber" value={currentSettings.whatsappNumber} onChange={handleSettingsChange} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Salvar Alterações</Button>
                </CardFooter>
              </form>
            </Card>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Painel do Administrador</h1>
          {renderHeaderButton()}
        </div>
        
        <div className="mt-6">
          {renderContent()}
        </div>

      </div>
      <BolaoFormModal isOpen={isBolaoModalOpen} onClose={() => setIsBolaoModalOpen(false)} />
      <ChampionshipFormModal isOpen={isChampionshipModalOpen} onClose={() => setIsChampionshipModalOpen(false)} />
      <TeamFormModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} />
    </>
  );
};

// Wrap with a Suspense boundary because useSearchParams can suspend
const AdminPageWithSuspense = () => (
  <React.Suspense fallback={<div>Loading...</div>}>
    <AdminPage />
  </React.Suspense>
);

export default AdminPageWithSuspense;
