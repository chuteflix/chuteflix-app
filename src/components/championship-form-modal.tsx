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
import { Championship } from "@/types" // Simplificando a importação

interface ChampionshipFormModalProps {
  championship?: Championship | null
  onSave: (data: Omit<Championship, "id">) => void
  children: React.ReactNode
}

// O tipo foi simplificado e não é mais necessário aqui.
// A lógica de tipo/escopo será gerenciada pelas categorias.
const initialFormData: Omit<Championship, "id" | 'type' | 'competitionType'> = {
  name: "",
}

export function ChampionshipFormModal({
  championship,
  onSave,
  children,
}: ChampionshipFormModalProps) {
  const [open, setOpen] = useState(false)
  // Estado simplificado
  const [formData, setFormData] = useState(initialFormData)

  const isEditing = !!championship

  useEffect(() => {
    if (open) {
      if (isEditing && championship) {
        // Apenas o nome é necessário agora
        setFormData({
            name: championship.name,
        })
      } else {
        setFormData(initialFormData)
      }
    }
  }, [open, isEditing, championship])
  
  const handleChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // A estrutura do campeonato agora é muito mais simples
    const championshipData: Omit<Championship, "id"> = {
        name: formData.name,
        // Valores padrão para os campos que mantivemos no tipo, mas removemos da UI
        type: 'professional', 
        competitionType: 'national',
    };
    onSave(championshipData)
    setOpen(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Campeonato" : "Adicionar Campeonato"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="name">Nome do Campeonato</Label>
            <Input 
                id="name"
                value={formData.name} 
                onChange={e => handleChange("name", e.target.value)} 
                placeholder="Ex: Brasileirão Série A 2024"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
