
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  addChampionship,
  getChampionships,
  updateChampionship,
  deleteChampionship,
} from "@/services/championships"
import { Championship } from "@/types"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge"
import { Eye, Pencil, Trash2, Ticket } from "lucide-react"
import { ChampionshipFormModal } from "@/components/championship-form-modal"
import { ChampionshipDetailsModal } from "@/components/championship-details-modal"

export default function CampeonatosPage() {
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChampionships = async () => {
    setLoading(true)
    try {
      const fetchedChampionships = await getChampionships()
      setChampionships(fetchedChampionships)
    } catch (err) {
      setError("Falha ao buscar campeonatos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChampionships()
  }, [])

  const handleSave = async (data: Omit<Championship, "id">, id?: string) => {
    try {
        if (id) {
            await updateChampionship(id, data);
        } else {
            await addChampionship(data);
        }
        fetchChampionships();
    } catch (err) {
        setError("Falha ao salvar campeonato.");
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteChampionship(id)
      fetchChampionships();
    } catch (err) {
      setError("Falha ao deletar campeonato.")
    }
  }

  const getLocation = (champ: Championship) => {
    if (champ.competitionType === 'international') {
      return `${champ.country}, ${champ.continent}`;
    }
    return champ.city ? `${champ.city}, ${champ.state}`: champ.state || 'Nacional';
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">
                Gerenciamento de Campeonatos
            </h1>
            <p className="text-muted-foreground">
                Adicione, edite e visualize os campeonatos da plataforma.
            </p>
        </div>
        <ChampionshipFormModal onSave={(data) => handleSave(data)}>
            <Button>Adicionar Campeonato</Button>
        </ChampionshipFormModal>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campeonatos Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os campeonatos no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo de Competição</TableHead>
                <TableHead>Local</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Carregando...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-red-500">{error}</TableCell>
                </TableRow>
              ) : championships.length > 0 ? (
                championships.map(champ => (
                  <TableRow key={champ.id}>
                    <TableCell className="font-medium">{champ.name}</TableCell>
                    <TableCell>
                        <Badge variant={champ.competitionType === 'national' ? 'default' : 'secondary'}>
                            {champ.competitionType === 'national' ? 'Nacional' : 'Internacional'}
                        </Badge>
                    </TableCell>
                    <TableCell>{getLocation(champ)}</TableCell>
                    <TableCell className="text-right">
                        <Link href={`/admin/boloes?championshipId=${champ.id}`}>
                            <Button variant="ghost" size="icon">
                                <Ticket className="h-4 w-4" />
                            </Button>
                        </Link>

                      <ChampionshipDetailsModal championship={champ}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </ChampionshipDetailsModal>

                      <ChampionshipFormModal
                        championship={champ}
                        onSave={(data) => handleSave(data, champ.id)}
                      >
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </ChampionshipFormModal>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser desfeita. Isso irá deletar o campeonato permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(champ.id)}>
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Nenhum campeonato encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
