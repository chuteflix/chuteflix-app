"use client";

import { History, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BolaoCard } from "@/components/bolao-card";
import { myGuesses, history } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-primary">Meu Painel</h1>
      <Tabs defaultValue="guesses" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="guesses"><Info className="mr-2 h-4 w-4" />Meus Chutes</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="guesses" className="mt-6">
            {myGuesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {myGuesses.map((bolao) => (
                        <BolaoCard key={bolao.id} bolao={bolao} isAuthenticated={true} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-card rounded-lg mt-6 border">
                    <p className="text-muted-foreground">Você ainda não fez nenhum palpite.</p>
                </div>
            )}
        </TabsContent>
        <TabsContent value="history" className="mt-6">
           <div className="bg-card rounded-lg overflow-hidden border">
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Partida</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Seu Palpite</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead className="text-right">Prêmio</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.teamA.name} vs {item.teamB.name}</TableCell>
                            <TableCell>{format(item.matchDate, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                            <TableCell>{item.userGuess?.teamA} x {item.userGuess?.teamB}</TableCell>
                            <TableCell className="font-bold">{item.result.teamA} x {item.result.teamB}</TableCell>
                            <TableCell className="text-right">
                                {item.prize > 0 ? (
                                    <Badge variant="success">R$ {item.prize.toFixed(2)}</Badge>
                                ) : (
                                    <Badge variant="secondary">R$ 0.00</Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
