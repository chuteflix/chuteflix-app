
"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Bolao } from '@/services/boloes';
import { getTeamById, Team } from '@/services/teams';
import { getChampionshipById, Championship } from '@/services/championships';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PalpiteModal } from '@/components/palpite-modal';
import { ArrowLeft, Calendar, Shield, Trophy } from 'lucide-react';
import Link from 'next/link';

type BolaoDetails = Bolao & {
  team1Details?: Team;
  team2Details?: Team;
  championshipDetails?: Championship;
};

export default function BolaoPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const id = params.id as string;

  const [bolao, setBolao] = useState<BolaoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchBolaoDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const bolaoDoc = await getDoc(doc(db, 'boloes', id));
        if (!bolaoDoc.exists()) throw new Error('Bolão não encontrado.');

        const bolaoData = { id: bolaoDoc.id, ...bolaoDoc.data() } as Bolao;
        
        const [team1Details, team2Details, championshipDetails] = await Promise.all([
          getTeamById(bolaoData.team1Id),
          getTeamById(bolaoData.team2Id),
          getChampionshipById(bolaoData.championshipId),
        ]);

        setBolao({ ...bolaoData, team1Details, team2Details, championshipDetails });

      } catch (err) {
        console.error("Erro ao buscar detalhes do bolão:", err);
        setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
      } finally {
        setLoading(false);
      }
    };

    fetchBolaoDetails();
  }, [id]);

  const handleChutarClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      setIsModalOpen(true);
    }
  };
  
  const MatchInfo = () => (
    <div className="flex items-center justify-center space-x-4 sm:space-x-8 md:space-x-12 my-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-border">
          <AvatarImage src={bolao?.team1Details?.logoUrl} alt={bolao?.team1Details?.name} />
          <AvatarFallback>{bolao?.team1Details?.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-lg">{bolao?.team1Details?.name}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-muted-foreground">VS</div>
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-border">
          <AvatarImage src={bolao?.team2Details?.logoUrl} alt={bolao?.team2Details?.name} />
          <AvatarFallback>{bolao?.team2Details?.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-lg">{bolao?.team2Details?.name}</span>
      </div>
    </div>
  );
  
  const LoadingSkeleton = () => (
    <div className="max-w-4xl mx-auto">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <Card>
          <CardHeader><Skeleton className="h-7 w-3/5 mb-2" /><Skeleton className="h-5 w-1/2" /></CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center gap-3"><Skeleton className="h-20 w-20 rounded-full" /><Skeleton className="h-6 w-24" /></div>
              <Skeleton className="h-8 w-12" />
              <div className="flex flex-col items-center gap-3"><Skeleton className="h-20 w-20 rounded-full" /><Skeleton className="h-6 w-24" /></div>
            </div>
            <Separator />
            <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-10 w-1/2 mx-auto" /></div>
          </CardContent>
        </Card>
      </div>
  );

  if (loading || authLoading) return <LoadingSkeleton />;

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Alert variant="destructive" className="max-w-lg"><AlertTitle>Erro ao Carregar</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
            <Button variant="outline" asChild className="mt-6"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Voltar para a Home</Link></Button>
        </div>
    );
  }

  return (
    <>
        <div className="max-w-4xl mx-auto">
            <Button variant="outline" size="sm" asChild className="mb-4"><Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Voltar para o Dashboard</Link></Button>
            <Card className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-2xl sm:text-3xl font-bold">{bolao?.name}</CardTitle>
                        <Badge variant={bolao?.status === 'Aberto' ? 'success' : 'secondary'}>{bolao?.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1.5"><Trophy className="h-4 w-4" /><span>{bolao?.championshipDetails?.name || 'Campeonato'}</span></div>
                        <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /><span>Encerra em: {new Date(bolao?.closingDate || '').toLocaleDateString('pt-BR')}</span></div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <MatchInfo />
                    <Separator className="my-6" />
                    <div className="text-center">
                        <Button 
                            size="lg" 
                            onClick={handleChutarClick} 
                            disabled={bolao?.status !== 'Aberto'}
                        >
                            Chutar Placar
                        </Button>
                        {bolao?.status !== 'Aberto' && (
                            <p className="text-sm text-muted-foreground mt-3">Este bolão não está mais aceitando palpites.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
        {bolao && (
            <PalpiteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                bolao={bolao}
            />
        )}
    </>
  );
}
