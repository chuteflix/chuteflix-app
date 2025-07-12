
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
import { Team } from "@/services/teams"
import { getStates, getCitiesByState, IBGEState, IBGECity } from "@/services/ibge"

interface TeamFormModalProps {
  team?: Team | null
  onSave: (data: Omit<Team, "id">, id?: string) => void
  children: React.ReactNode
}

const initialFormData: Omit<Team, "id"> = {
  name: "",
  shieldUrl: "",
  state: "",
  city: "",
}

export function TeamFormModal({
  team,
  onSave,
  children,
}: TeamFormModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Omit<Team, "id">>(initialFormData)
  const [states, setStates] = useState<IBGEState[]>([])
  const [cities, setCities] = useState<IBGECity[]>([])
  const [loadingCities, setLoadingCities] = useState(false)

  const isEditing = !!team

  useEffect(() => {
    if (open) {
      const loadStates = async () => {
        const ibgeStates = await getStates()
        setStates(ibgeStates)
      }
      loadStates()
      
      if (isEditing && team) {
        setFormData({
            name: team.name,
            shieldUrl: team.shieldUrl,
            state: team.state,
            city: team.city,
        })
      } else {
        setFormData(initialFormData)
      }
    }
  }, [open, isEditing, team])

  useEffect(() => {
    if (formData.state) {
      const loadCities = async () => {
        setLoadingCities(true)
        const ibgeCities = await getCitiesByState(formData.state!)
        setCities(ibgeCities)
        setLoadingCities(false)
      }
      loadCities()
    } else {
      setCities([])
    }
  }, [formData.state])

  const handleChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData, isEditing ? team.id : undefined)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Time" : "Adicionar Time"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label>Nome do Time</Label>
            <Input value={formData.name} onChange={e => handleChange("name", e.target.value)} />

            <Label>URL do Escudo</Label>
            <Input value={formData.shieldUrl} onChange={e => handleChange("shieldUrl", e.target.value)} />
            
            <Label>Estado</Label>
            <Select onValueChange={value => handleChange("state", value)} value={formData.state}>
              <SelectTrigger><SelectValue placeholder="Selecione um estado" /></SelectTrigger>
              <SelectContent>
                {states.map(s => <SelectItem key={s.id} value={s.sigla}>{s.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            
            <Label>Cidade</Label>
            <Select onValueChange={value => handleChange("city", value)} value={formData.city} disabled={!formData.state || loadingCities}>
              <SelectTrigger><SelectValue placeholder={loadingCities ? "Carregando..." : "Selecione uma cidade"} /></SelectTrigger>
              <SelectContent>
                {cities.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>

          </div>
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
