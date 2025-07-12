"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { history } from "@/lib/data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HistoryPage() {
  return (
    <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-primary">Histórico</h1>
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
                        <TableCell>{format(item.matchStartDate, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
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
        </Table>>
       </div>
    </div>
  );
}
