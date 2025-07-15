
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
import { Championship } from "@/services/championships"
import { getStates, getCitiesByState, IBGEState, IBGECity } from "@/services/ibge"
import { continents, countriesByContinent } from "@/lib/countries"

interface ChampionshipFormModalProps {
  championship?: Championship | null
  onSave: (data: Omit<Championship, "id">) => void
  children: React.ReactNode
}

const initialFormData: Omit<Championship, "id"> = {
  name: "",
  type: "amateur",
  competitionType: "national",
}

export function ChampionshipFormModal({
  championship,
  onSave,
  children,
}: ChampionshipFormModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Omit<Championship, "id">>(initialFormData)
  const [states, setStates] = useState<IBGEState[]>([])
  const [cities, setCities] = useState<IBGECity[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([])

  const isEditing = !!championship

  useEffect(() => {
    if (open) {
      const loadStates = async () => {
        const ibgeStates = await getStates()
        setStates(ibgeStates)
      }
      loadStates()
      
      if (isEditing && championship) {
        setFormData({
            name: championship.name,
            type: championship.type,
            competitionType: championship.competitionType || 'national',
            scope: championship.scope,
            series: championship.series,
            state: championship.state,
            city: championship.city,
            continent: championship.continent,
            country: championship.country,
        })
      } else {
        setFormData(initialFormData)
      }
    }
  }, [open, isEditing, championship])

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

  useEffect(() => {
    if (formData.continent) {
      setCountries(countriesByContinent[formData.continent] || [])
    } else {
      setCountries([])
    }
  }, [formData.continent])
  
  const handleChange = (id: string, value: string) => {
    const newFormData: any = { ...formData, [id]: value }

    if (id === "competitionType") {
      delete newFormData.type
      delete newFormData.scope
      delete newFormData.series
      delete newFormData.state
      delete newFormData.city
      delete newFormData.continent
      delete newFormData.country
      if (value === 'international') {
        newFormData.type = 'professional'
      }
    }

    if (id === "type") {
      delete newFormData.scope
      delete newFormData.series
      if(value === 'professional') {
        delete newFormData.state
        delete newFormData.city
      }
    }
    if (id === "scope") {
        delete newFormData.state
        delete newFormData.city
        // Garante que a série só exista para escopo nacional
        if (value !== 'national') {
            delete newFormData.series
        }
    }
    if (id === "state") {
        delete newFormData.city
    }
    if (id === "continent") {
        delete newFormData.country
    }

    setFormData(newFormData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    setOpen(false)
  }
  
  const showNationalFields = formData.competitionType === 'national';
  const showInternationalFields = formData.competitionType === 'international';
  const showProfessionalFields = formData.type === 'professional';
  const showSeriesField = showProfessionalFields && formData.scope === 'national';
  const showStateField = showNationalFields && (formData.type === 'amateur' || (showProfessionalFields && (formData.scope === 'state' || formData.scope === 'municipal')));
  const showCityField = showNationalFields && (formData.type === 'amateur' || (showProfessionalFields && formData.scope === 'municipal'));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Campeonato" : "Adicionar Campeonato"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label>Nome</Label>
            <Input value={formData.name} onChange={e => handleChange("name", e.target.value)} />

            <Label>Competição</Label>
            <Select onValueChange={value => handleChange("competitionType", value)} value={formData.competitionType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="national">Nacional/Brasileiro</SelectItem>
                <SelectItem value="international">Internacional</SelectItem>
              </SelectContent>
            </Select>

            {showNationalFields && (
              <>
                <Label>Tipo</Label>
                <Select onValueChange={value => handleChange("type", value)} value={formData.type}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Profissional</SelectItem>
                    <SelectItem value="amateur">Amador/Várzea</SelectItem>
                  </SelectContent>
                </Select>

                {showProfessionalFields && (
                  <>
                    <Label>Projeção</Label>
                    <Select onValueChange={value => handleChange("scope", value)} value={formData.scope}>
                      <SelectTrigger><SelectValue placeholder="Selecione a projeção"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">Nacional</SelectItem>
                        <SelectItem value="state">Estadual</SelectItem>
                        <SelectItem value="municipal">Municipal</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}

                {showSeriesField && (
                    <>
                        <Label>Série</Label>
                        <Select onValueChange={value => handleChange("series", value)} value={formData.series}>
                        <SelectTrigger><SelectValue placeholder="Selecione a série"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="A">Série A</SelectItem>
                            <SelectItem value="B">Série B</SelectItem>
                            <SelectItem value="C">Série C</SelectItem>
                            <SelectItem value="D">Série D</SelectItem>
                        </SelectContent>
                        </Select>
                    </>
                )}

                {showStateField && (
                    <>
                        <Label>Estado</Label>
                        <Select onValueChange={value => handleChange("state", value)} value={formData.state}>
                            <SelectTrigger><SelectValue placeholder="Selecione um estado" /></SelectTrigger>
                            <SelectContent>
                                {states.map(s => <SelectItem key={s.id} value={s.sigla}>{s.nome}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </>
                )}

                {showCityField && (
                    <>
                        <Label>Cidade</Label>
                        <Select onValueChange={value => handleChange("city", value)} value={formData.city} disabled={!formData.state || loadingCities}>
                        <SelectTrigger><SelectValue placeholder={loadingCities ? "Carregando..." : "Selecione uma cidade"} /></SelectTrigger>
                        <SelectContent>
                            {cities.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
                        </SelectContent>
                        </Select>
                    </>
                )}
              </>
            )}

            {showInternationalFields && (
              <>
                <Label>Continente</Label>
                <Select onValueChange={value => handleChange("continent", value)} value={formData.continent}>
                  <SelectTrigger><SelectValue placeholder="Selecione o continente"/></SelectTrigger>
                  <SelectContent>
                    {continents.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Label>País</Label>
                <Select onValueChange={value => handleChange("country", value)} value={formData.country} disabled={!formData.continent}>
                  <SelectTrigger><SelectValue placeholder="Selecione o país"/></SelectTrigger>
                  <SelectContent>
                    {countries.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </>
            )}

          </div>
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
