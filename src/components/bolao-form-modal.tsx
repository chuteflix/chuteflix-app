
"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Bolao } from "@/services/boloes"
import { getChampionships, Championship } from "@/services/championships"
import { getTeams, Team } from "@/services/teams"
import { NumberFormatValues, PatternFormat, NumericFormat } from 'react-number-format';
import { cn } from "@/lib/utils"

interface BolaoFormModalProps {
  bolao?: Bolao | null
  onSave: (data: Omit<Bolao, "id" | "status" | "name">, id?: string) => void
  children: React.ReactNode
}

const initialFormData = {
    championshipId: "",
    teamAId: "",
    teamBId: "",
    matchDate: undefined,
    startTime: "",
    endTime: "",
    fee: "",
    initialPrize: "",
    closingTime: "",
}

export function BolaoFormModal({
  bolao,
  onSave,
  children,
}: BolaoFormModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>(initialFormData)
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
            matchDate: new Date(bolao.matchDate),
            startTime: bolao.startTime,
            endTime: bolao.endTime,
            fee: String(bolao.fee),
            initialPrize: String(bolao.initialPrize || '0'),
            closingTime: bolao.closingTime,
        })
      } else {
        setFormData(initialFormData)
      }
    }
  }, [open, isEditing, bolao])

  const handleValueChange = (values: NumberFormatValues, id: string) => {
    handleChange(id, values.floatValue || '');
  }

  const handleChange = (id: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { fee, initialPrize, matchDate, ...rest } = formData;

    const requiredFields: (keyof typeof initialFormData)[] = [
        "championshipId", "teamAId", "teamBId", "matchDate", 
        "startTime", "endTime", "closingTime"
    ];

    for (const field of requiredFields) {
        if (!formData[field]) {
            setError("Todos os campos são obrigatórios.")
            return
        }
    }
    
    onSave({ 
        ...rest, 
        fee: parseFloat(fee) || 0, 
        initialPrize: parseFloat(initialPrize) || 0,
        matchDate: format(matchDate, "yyyy-MM-dd"),
    }, isEditing ? bolao!.id : undefined)
    
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Bolão" : "Criar Novo Bolão"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">

            <div className="col-span-2">
              <Label>Campeonato</Label>
              <Select onValueChange={value => handleChange("championshipId", value)} value={formData.championshipId}>
                  <SelectTrigger><SelectValue placeholder="Selecione um campeonato"/></SelectTrigger>
                  <SelectContent>
                      {championships.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Time A</Label>
              <Select onValueChange={value => handleChange("teamAId", value)} value={formData.teamAId}>
                  <SelectTrigger><SelectValue placeholder="Selecione o Time A"/></SelectTrigger>
                  <SelectContent>
                      {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Time B</Label>
              <Select onValueChange={value => handleChange("teamBId", value)} value={formData.teamBId}>
                  <SelectTrigger><SelectValue placeholder="Selecione o Time B"/></SelectTrigger>
                  <SelectContent>
                      {teams.filter(t => t.id !== formData.teamAId).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valor da Taxa (R$)</Label>
              <NumericFormat
                  customInput={Input}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  value={formData.fee}
                  onValueChange={(values) => handleValueChange(values, 'fee')}
              />
            </div>
            <div>
              <Label>Prêmio Inicial (R$)</Label>
              <NumericFormat
                  customInput={Input}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  value={formData.initialPrize}
                  onValueChange={(values) => handleValueChange(values, 'initialPrize')}
              />
            </div>
            
            <div>
              <Label>Data da Partida</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.matchDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.matchDate ? format(formData.matchDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.matchDate}
                    onSelect={(date) => handleChange("matchDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Horário Limite para Apostas</Label>
              <PatternFormat
                customInput={Input}
                format="##:##"
                placeholder="HH:MM"
                mask={['H', 'H', 'M', 'M']}
                value={formData.closingTime}
                onValueChange={(values) => handleChange('closingTime', values.formattedValue)}
              />
            </div>

            <div>
              <Label>Início da Partida</Label>
              <PatternFormat
                customInput={Input}
                format="##:##"
                placeholder="HH:MM"
                mask={['H', 'H', 'M', 'M']}
                value={formData.startTime}
                onValueChange={(values) => handleChange('startTime', values.formattedValue)}
              />
            </div>
            <div>
              <Label>Fim da Partida</Label>
              <PatternFormat
                customInput={Input}
                format="##:##"
                placeholder="HH:MM"
                mask={['H', 'H', 'M', 'M']}
                value={formData.endTime}
                onValueChange={(values) => handleChange('endTime', values.formattedValue)}
              />
            </div>
            
            {error && <p className="col-span-2 text-red-500 text-sm text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">{isEditing ? "Salvar Alterações" : "Criar Bolão"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
