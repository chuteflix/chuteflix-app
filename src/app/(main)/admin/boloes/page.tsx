
"use client"

import { MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BolaoFormModal } from "@/components/bolao-form-modal"

const boloes = [
  {
    nome: "Bolão Brasileirão 2024",
    premio: "R$ 10.000,00",
    status: "Ativo",
    participantes: 152,
  },
  {
    nome: "Bolão Libertadores 2024",
    premio: "R$ 5.000,00",
    status: "Ativo",
    participantes: 89,
  },
  {
    nome: "Bolão Copa do Mundo 2026",
    premio: "R$ 25.000,00",
    status: "Em breve",
    participantes: 0,
  },
  {
    nome: "Bolão Eurocopa 2024",
    premio: "R$ 7.500,00",
    status: "Finalizado",
    participantes: 112,
  },
]

export default function BoloesPage() {
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gerenciamento de Bolões
          </h1>
          <p className="text-muted-foreground">
            Acompanhe, adicione e gerencie os bolões da plataforma.
          </p>
        </div>
        <BolaoFormModal>
          <Button>Adicionar Bolão</Button>
        </BolaoFormModal>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bolões Cadastrados</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os bolões existentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Prêmio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boloes.map(bolao => (
                <TableRow key={bolao.nome}>
                  <TableCell className="font-medium">{bolao.nome}</TableCell>
                  <TableCell>{bolao.premio}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        bolao.status === "Ativo"
                          ? "default"
                          : bolao.status === "Em breve"
                          ? "outline"
                          : "destructive"
                      }
                    >
                      {bolao.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{bolao.participantes}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>1-4</strong> de <strong>4</strong> bolões
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
