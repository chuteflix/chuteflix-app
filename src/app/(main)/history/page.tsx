"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { history } from "@/lib/data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HistoryPage() {
  return (
    <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-50">Histórico de Palpites</h1>
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-gray-800">
                        <TableHead className="text-gray-300">Partida</TableHead>
                        <TableHead className="text-gray-300">Data</TableHead>
                        <TableHead className="text-gray-300">Seu Palpite</TableHead>
                        <TableHead className="text-gray-300">Resultado</TableHead>
                        <TableHead className="text-right text-gray-300">Prêmio</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.map((item) => (
                        <TableRow key={item.id} className="border-b-gray-800">
                            <TableCell className="font-medium text-gray-200">{item.teamA.name} vs {item.teamB.name}</TableCell>
                            <TableCell className="text-gray-400">{format(item.matchStartDate, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                            <TableCell className="text-gray-400">{item.userGuess?.teamA} x {item.userGuess?.teamB}</TableCell>
                            <TableCell className="font-bold text-gray-200">{item.result.teamA} x {item.result.teamB}</TableCell>
                            <TableCell className="text-right">
                                {item.prize > 0 ? (
                                    <Badge style={{ backgroundColor: '#39FF14', color: 'black' }} className="font-bold">
                                        R$ {item.prize.toFixed(2)}
                                    </Badge>
                                ) : (
                                    <Badge style={{ backgroundColor: '#FF073A', color: 'white' }} className="font-bold">
                                        R$ 0.00
                                    </Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}
