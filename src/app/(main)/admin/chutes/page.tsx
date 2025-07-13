
"use client"

import React, { useState, useEffect } from 'react';
import { getPalpitesByStatus, Palpite, updatePalpiteStatus } from '@/services/palpites';
import { getUserProfile, UserProfile } from '@/services/users';
import { getBolaoById, Bolao } from '@/services/boloes';
import { getTeamById, Team } from '@/services/teams';
import { getChampionshipById, Championship } from '@/services/championships';
import { Eye, Check, X } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PalpiteComDetalhes = Palpite & {
  user?: UserProfile;
  bolao?: Bolao & {
    teamA?: Team;
    teamB?: Team;
    championship?: Championship;
  };
  receiptUrl?: string;
};

const statusParaFiltro = {
  pendentes: "Pendente",
  aprovados: "Aprovado",
  recusados: "Recusado",
};

export default function AdminChutesPage() {
  const [palpites, setPalpites] = useState<PalpiteComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pendentes");
  const { toast } = useToast();

  useEffect(() => {
    const fetchPalpites = async () => {
      setLoading(true);
      try {
        const status = statusParaFiltro[activeTab as keyof typeof statusParaFiltro];
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

            return {
              ...palpite,
              user,
              bolao: bolao ? { ...bolao, teamA, teamB, championship } : undefined,
              receiptUrl: palpite.receiptUrl,
            };
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

    fetchPalpites();
  }, [activeTab, toast]);

  const handleUpdateStatus = async (id: string, newStatus: "Aprovado" | "Recusado") => {
    try {
      await updatePalpiteStatus(id, newStatus);
      setPalpites((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Status atualizado!",
        description: `O palpite foi ${newStatus === "Aprovado" ? "aprovado" : "recusado"}.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o palpite. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Gerenciamento de Chutes</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="aprovados">Aprovados</TabsTrigger>
          <TabsTrigger value="recusados">Recusados</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          <ChutesTable
            palpites={palpites}
            loading={loading}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChutesTable({
  palpites,
  loading,
  onUpdateStatus,
}: {
  palpites: PalpiteComDetalhes[];
  loading: boolean;
  onUpdateStatus: (id: string, status: "Aprovado" | "Recusado") => void;
}) {
  if (loading) {
    return <div>Carregando...</div>;
  }

  if (palpites.length === 0) {
    return <div className="text-center py-12">Nenhum chute encontrado.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuário</TableHead>
          <TableHead>Bolão</TableHead>
          <TableHead>Palpite</TableHead>
          <TableHead>Comprovante</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {palpites.map((palpite) => (
          <TableRow key={palpite.id}>
            <TableCell>{palpite.user?.displayName || "N/A"}</TableCell>
            <TableCell>{palpite.bolao?.name || "N/A"}</TableCell>
            <TableCell>
              {palpite.bolao?.teamA?.name} {palpite.scoreTeam1} x {palpite.scoreTeam2} {palpite.bolao?.teamB?.name}
            </TableCell>
            <TableCell>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!palpite.receiptUrl}>
                    <Eye className="mr-2 h-4 w-4" /> Ver
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Comprovante de Pagamento</DialogTitle>
                  </DialogHeader>
                  {palpite.receiptUrl ? (
                    <img src={palpite.receiptUrl} alt="Comprovante" className="w-full" />
                  ) : (
                    <p>Nenhum comprovante enviado.</p>
                  )}
                </DialogContent>
              </Dialog>
            </TableCell>
            <TableCell>
              {palpite.status === 'Pendente' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onUpdateStatus(palpite.id, "Aprovado")}>
                    <Check className="mr-2 h-4 w-4" /> Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onUpdateStatus(palpite.id, "Recusado")}
                  >
                    <X className="mr-2 h-4 w-4" /> Recusar
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
