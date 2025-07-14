
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { getPalpitesComDetalhes, PalpiteComDetalhes, updatePalpiteStatus } from "@/services/palpites"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Ticket, History, Upload, CheckCircle2, XCircle, Clock } from "lucide-react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

export default function MeusChutesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [palpites, setPalpites] = useState<PalpiteComDetalhes[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchPalpites = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getPalpitesComDetalhes(user.uid)
      setPalpites(data)
    } catch (err) {
      setError("Não foi possível carregar seus chutes.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPalpites()
  }, [user])

  const handleReceiptUpload = async (palpiteId: string, file: File) => {
    if (!file) {
      toast({ title: "Nenhum arquivo selecionado", variant: "destructive" });
      return;
    }
    try {
      const receiptRef = ref(storage, `receipts/${palpiteId}/${file.name}`);
      await uploadBytes(receiptRef, file);
      const receiptUrl = await getDownloadURL(receiptRef);
      
      const palpiteDocRef = doc(db, "palpites", palpiteId);
      await updateDoc(palpiteDocRef, { receiptUrl });

      toast({ title: "Comprovante enviado!", description: "Aguarde a aprovação do administrador.", variant: "success" });
      fetchPalpites(); // Refresh list
    } catch (error) {
      toast({ title: "Erro no Upload", description: "Não foi possível enviar o comprovante.", variant: "destructive" });
    }
  };


  const palpitesEmAndamento = palpites.filter(p => p.bolaoDetails?.status !== 'Finalizado');
  const historicoDeChutes = palpites.filter(p => p.bolaoDetails?.status === 'Finalizado');

  const getStatusDetails = (status: Palpite['status']) => {
    switch (status) {
      case 'Aprovado': return { label: 'Aprovado', icon: <CheckCircle2 className="h-4 w-4 text-success" />, color: 'text-success' };
      case 'Recusado': return { label: 'Recusado', icon: <XCircle className="h-4 w-4 text-destructive" />, color: 'text-destructive' };
      default: return { label: 'Pendente', icon: <Clock className="h-4 w-4 text-amber-500" />, color: 'text-amber-500' };
    }
  };

  if (loading) return <SkeletonLoader />;
  if (error) return <Alert variant="destructive"><AlertTitle>Erro</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="container mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Meus Chutes</h1>
        <p className="text-muted-foreground">Acompanhe seus palpites em andamento e seu histórico.</p>
      </div>
      
      {/* --- Chutes em Andamento --- */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Ticket />Em Andamento</h2>
        {palpitesEmAndamento.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {palpitesEmAndamento.map(p => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-base">{p.bolaoDetails?.name}</CardTitle>
                  <CardDescription>{p.bolaoDetails?.championshipDetails?.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-center mb-2">{p.scoreTeam1} x {p.scoreTeam2}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold">Seu Status:</span>
                    <Badge variant={p.status === 'Aprovado' ? 'success' : p.status === 'Recusado' ? 'destructive' : 'secondary'}>
                      {getStatusDetails(p.status).label}
                    </Badge>
                  </div>
                  {p.status === 'Pendente' && !p.receiptUrl && (
                    <div className="mt-4">
                      <label htmlFor={`receipt-${p.id}`} className="text-xs font-bold">Enviar Comprovante:</label>
                      <div className="flex gap-2">
                        <Input id={`receipt-${p.id}`} type="file" accept="image/*" className="text-xs h-9" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleReceiptUpload(p.id, e.target.files[0]);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">Você não tem nenhum chute em bolões abertos.</p>
          </div>
        )}
      </section>

      {/* --- Histórico de Chutes --- */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><History />Histórico</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partida</TableHead>
                <TableHead>Seu Palpite</TableHead>
                <TableHead>Resultado Final</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Prêmio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historicoDeChutes.length > 0 ? (
                historicoDeChutes.map(p => {
                  const isWinner = p.status === 'Aprovado' && p.scoreTeam1 === p.bolaoDetails?.scoreTeam1 && p.scoreTeam2 === p.bolaoDetails?.scoreTeam2;
                  // Este cálculo é uma estimativa, o valor real vem da transação de prêmio
                  const prize = 0; // TODO: Buscar o valor da transação de prêmio
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{p.bolaoDetails?.name}</TableCell>
                      <TableCell>{p.scoreTeam1} x {p.scoreTeam2}</TableCell>
                      <TableCell>{p.bolaoDetails?.scoreTeam1 ?? '-'} x {p.bolaoDetails?.scoreTeam2 ?? '-'}</TableCell>
                      <TableCell><Badge variant={isWinner ? 'success' : 'outline'}>{isWinner ? "Ganhador" : "Não foi dessa vez"}</Badge></TableCell>
                      <TableCell className="text-right font-bold text-success">{prize.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">Nenhum chute finalizado no seu histórico.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  )
}

const SkeletonLoader = () => (
    <div className="container mx-auto space-y-8">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <section>
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </section>
      <section>
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </section>
    </div>
)
