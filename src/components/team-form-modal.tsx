"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Team, TeamData } from "@/services/teams"
import { getStates, getCitiesByState, IBGEState, IBGECity } from "@/services/ibge"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { uploadFileToApi } from "@/services/upload" // 1. Importar a função de upload da API

interface TeamFormModalProps {
  team?: Team | null
  onSave: (data: Omit<Team, 'id'>, id?: string) => void
  children: React.ReactNode
}

const initialFormData = {
  name: "",
  state: "",
  city: "",
  shieldUrl: "",
};

export function TeamFormModal({
  team,
  onSave,
  children,
}: TeamFormModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [shieldFile, setShieldFile] = useState<File | null>(null);
  const [states, setStates] = useState<IBGEState[]>([])
  const [cities, setCities] = useState<IBGECity[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

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
            state: team.state || "",
            city: team.city || "",
            shieldUrl: team.shieldUrl || "",
        })
        setShieldFile(null);
      } else {
        setFormData(initialFormData)
        setShieldFile(null);
      }
    }
  }, [open, isEditing, team])

  useEffect(() => {
    if (formData.state) {
      const loadCities = async () => {
        setLoadingCities(true)
        const ibgeCities = await getCitiesByState(formData.state)
        setCities(ibgeCities)
        if (!isEditing || (isEditing && team?.state !== formData.state)) {
            setFormData(prev => ({ ...prev, city: "" }))
        }
        setLoadingCities(false)
      }
      loadCities()
    } else {
      setCities([])
    }
  }, [formData.state, isEditing, team?.state])

  const handleChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setShieldFile(file);
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, shieldUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      let finalShieldUrl = formData.shieldUrl;

      if (shieldFile) {
        finalShieldUrl = await uploadFileToApi(shieldFile);
      }
      
      // @ts-ignore
      const dataToSave: Omit<Team, 'id'> = {
        name: formData.name,
        state: formData.state,
        city: formData.city,
        shieldUrl: finalShieldUrl,
      };

      onSave(dataToSave, isEditing ? team.id : undefined)
      setOpen(false)
    } catch (error) {
      toast({ title: "Erro ao salvar o time", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Time" : "Adicionar Time"}</DialogTitle>
            <DialogDescription>
                Preencha as informações abaixo para {isEditing ? "editar o" : "adicionar um novo"} time.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              {formData.shieldUrl && <Image src={formData.shieldUrl} alt="Escudo" width={64} height={64} className="rounded-full" />}
              <div className="grid gap-2 w-full">
                <Label>Escudo do Time</Label>
                <Input type="file" onChange={handleFileChange} />
              </div>
            </div>

            <Label>Nome do Time</Label>
            <Input value={formData.name} onChange={e => handleChange("name", e.target.value)} required />
            
            <Label>Estado</Label>
            <Select onValueChange={value => handleChange("state", value)} value={formData.state} required>
              <SelectTrigger><SelectValue placeholder="Selecione um estado" /></SelectTrigger>
              <SelectContent>
                {states.map(s => <SelectItem key={s.id} value={s.sigla}>{s.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            
            <Label>Cidade</Label>
            <Select onValueChange={value => handleChange("city", value)} value={formData.city} disabled={!formData.state || loadingCities} required>
              <SelectTrigger><SelectValue placeholder={loadingCities ? "Carregando..." : "Selecione uma cidade"} /></SelectTrigger>
              <SelectContent>
                {cities.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>

          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
