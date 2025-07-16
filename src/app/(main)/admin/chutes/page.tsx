
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { getPalpitesByStatus, Palpite, updatePalpiteStatus, deletePalpite } from '@/services/palpites';
import { getUserProfile, UserProfile } from '@/services/users';
import { getBolaoById, Bolao } from '@/services/boloes';
import { getTeamById, Team } from '@/services/teams';
import { getChampionshipById, Championship } from '@/services/championships';
import { Ban, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type PalpiteComDetalhes = Palpite & {
  user?: UserProfile;
  bolao?: Bolao & {
    teamA?: Team;
    teamB?: Team;
    championship?: Championship;
  };
};

const statusMap = {
  "em-aberto": { label: "Em Aberto", variant: "secondary" },
  "ganho": { label: "Ganhos", variant: "success" },
  "perdido": { label: "Perdidos", variant: "destructive" },
  "anulado": { label: "Anulados", variant: "warning" },
};
type StatusKey = keyof typeof statusMap;

export default function AdminChutesPage() {
  const [palpites, setPalpites] = useState<PalpiteComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusKey>("em-aberto");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchPalpites = async () => {
    setLoading(true);
    try {
      const status = statusMap[statusFilter].label as Palpite['status'];
      const palpitesData = await getPalpitesByStatus(status);
      
      const palpitesComDetalhes = await Promise.all(
        palpitesData.map(async (palpite) => {
          const [user, bolao] = await Promise.all([
            getUserProfile(palpite.userId),
            getBolaoById(palpite.bolaoId),
          ]);

          const [teamA, teamB, championship] = bolao
            ? await Promise.all([
                getTeamById(bolao.teamAId),
                getTeamById(bolao.teamBId),
                getChampionshipById(bolao.championshipId),
              ])
            : [undefined, undefined, undefined];

          return { ...palpite, user, bolao: bolao ? { ...bolao, teamA, teamB, championship } : undefined };
        })
      );
      setPalpites(palpitesComDetalhes);
    } catch (error) {
      console.error("Erro ao buscar palpites:", error);
      toast({
        title: "Erro ao carregar palpites",
        description: "Não foi possível buscar os palpites. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPalpites();
  }, [statusFilter, toast]);

  const handleAnular = async (id: string) => {
    try {
      await updatePalpiteStatus(id, "Anulado");
      toast({
        title: "Palpite Anulado!",
        description: "O palpite foi anulado e o valor estornado ao usuário.",
        variant: "success",
      });
      fetchPalpites();
    } catch (error: any) {
      console.error("Erro ao anular palpite:", error);
      toast({
        title: "Erro ao anular",
        description: error.message || "Não foi possível anular o palpite.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePalpite(id);
      toast({
        title: "Palpite Excluído!",
        description: "O palpite foi excluído com sucesso.",
        variant: "success",
      });
      fetchPalpites();
    } catch (error: any) {
      console.error("Erro ao excluir palpite:", error);
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o palpite.",
        variant: "destructive",
      });
    }
  }
  
  const getFullName = (user?: UserProfile) => {
    if (!user) return "Usuário Inválido";
    return user.displayName || user.email || "Usuário Desconhecido";
  };

  const filteredPalpites = useMemo(() => {
    return palpites.filter(p =>
      getFullName(p.user).toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [palpites, searchTerm]);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Histórico de Chutes</h1>
            <p className="text-muted-foreground">Monitore, audite e gerencie os palpites da plataforma.</p>
          </div>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusKey)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusMap).map(([key, {label}]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Buscar por usuário ou email..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      <ChutesTable
        palpites={filteredPalpites}
        loading={loading}
        onAnular={handleAnular}
        onDelete={handleDelete}
        getFullName={getFullName}
      />
    </div>
  );
}

function ChutesTable({
  palpites,
  loading,
  onAnular,
  onDelete,
  getFullName,
}: {
  palpites: PalpiteComDetalhes[];
  loading: boolean;
  onAnular: (id: string) => void;
  onDelete: (id: string) => void;
  getFullName: (user?: UserProfile) => string;
}) {
  const getStatusVariant = (status: PalpiteStatus) => {
    switch (status) {
      case 'Ganho': return 'success';
      case 'Perdido': return 'destructive';
      case 'Anulado': return 'warning';
      default: return 'secondary';
    }
  }

  if (loading) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Bolão</TableHead>
                    <TableHead>Palpite</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
  }

  if (palpites.length === 0) {
    return <div className="text-center text-muted-foreground py-12">Nenhum chute encontrado para os filtros selecionados.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuário</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Bolão</TableHead>
          <TableHead>Palpite</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {palpites.map((palpite) => (
          <TableRow key={palpite.id}>
            <TableCell className="font-medium">{getFullName(palpite.user)}</TableCell>
            <TableCell>{format(palpite.createdAt.toDate(), 'dd/MM/yyyy HH:mm')}</TableCell>
            <TableCell>{palpite.bolao?.name || "N/A"}</TableCell>
            <TableCell>
              {palpite.bolao?.teamA?.name} {palpite.scoreTeam1} x {palpite.scoreTeam2} {palpite.bolao?.teamB?.name}
            </TableCell>
            <TableCell>R$ {palpite.amount.toFixed(2)}</TableCell>
            <TableCell>
                <Badge variant={getStatusVariant(palpite.status)}>
                    {palpite.status}
                </Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
              {(palpite.status === 'Em Aberto' || palpite.status === 'Aprovado') && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm"><Ban className="mr-2 h-4 w-4" /> Anular</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Anular este palpite?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O valor de R$ {palpite.amount.toFixed(2)} será estornado ao saldo do usuário.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onAnular(palpite.id)}>Confirmar Anulação</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Excluir</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Excluir este palpite?</AlertDialogTitle>
                      <AlertDialogDescription>
                          Esta ação não pode ser desfeita e o palpite será removido permanentemente.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(palpite.id)}>Confirmar Exclusão</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
