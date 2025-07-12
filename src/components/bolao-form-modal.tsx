
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bolao } from "@/services/boloes"
import { getChampionships, Championship } from "@/services/championships"
import { getTeams, Team } from "@/services/teams"

interface BolaoFormModalProps {
  bolao?: Bolao | null
  onSave: (data: Omit<Bolao, "id" | "status" | "name">, id?: string) => void
  children: React.ReactNode
}

const initialFormData = {
    championshipId: "",
    teamAId: "",
    teamBId: "",
    matchDate: "",
    startTime: "",
    endTime: "",
    fee: "",
}

export function BolaoFormModal({
  bolao,
  onSave,
  children,
}: BolaoFormModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [championships, setChampionships] = useState<Championship[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!bolao

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const [champs, allTeams] = await Promise.all([
          getChampionships(),
          getTeams(),
        ])
        setChampionships(champs)
        setTeams(allTeams)
      }
      fetchData()

      if(isEditing && bolao) {
        setFormData({
            championshipId: bolao.championshipId,
            teamAId: bolao.teamAId,
            teamBId: bolao.teamBId,
            matchDate: bolao.matchDate,
            startTime: bolao.startTime,
            endTime: bolao.endTime,
            fee: String(bolao.fee),
        })
      } else {
        setFormData(initialFormData)
      }
    }
  }, [open, isEditing, bolao])

  const handleChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { fee, ...rest } = formData
    if (Object.values(rest).some(val => !val)) {
        setError("Todos os campos são obrigatórios.")
        return
    }
    
    onSave({ ...rest, fee: parseFloat(fee) }, isEditing ? bolao.id : undefined)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Bolão" : "Adicionar Bolão"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">

            <Label>Campeonato</Label>
            <Select onValueChange={value => handleChange("championshipId", value)} value={formData.championshipId}>
                <SelectTrigger><SelectValue placeholder="Selecione um campeonato"/></SelectTrigger>
                <SelectContent>
                    {championships.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>

            <Label>Time A</Label>
            <Select onValueChange={value => handleChange("teamAId", value)} value={formData.teamAId}>
                <SelectTrigger><SelectValue placeholder="Selecione o Time A"/></SelectTrigger>
                <SelectContent>
                    {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
            </Select>
            
            <Label>Time B</Label>
            <Select onValueChange={value => handleChange("teamBId", value)} value={formData.teamBId}>
                <SelectTrigger><SelectValue placeholder="Selecione o Time B"/></SelectTrigger>
                <SelectContent>
                    {teams.filter(t => t.id !== formData.teamAId).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
            </Select>

            <Label>Valor da Aposta (R$)</Label>
            <Input type="number" value={formData.fee} onChange={e => handleChange("fee", e.target.value)} />
            
            <Label>Data da Partida</Label>
            <Input type="date" value={formData.matchDate} onChange={e => handleChange("matchDate", e.target.value)} />

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Início da Partida</Label>
                    <Input type="time" value={formData.startTime} onChange={e => handleChange("startTime", e.target.value)} />
                </div>
                <div>
                    <Label>Fim da Partida</Label>
                    <Input type="time" value={formData.endTime} onChange={e => handleChange("endTime", e.target.value)} />
                </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
