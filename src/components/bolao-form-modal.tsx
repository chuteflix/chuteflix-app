
"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, isValid, parse } from "date-fns"
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronsUpDown,
  Check,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Bolao, Team } from "@/types"
import { getTeams } from "@/services/teams"
import { Category } from "@/services/categories"
import { useCategories } from "@/hooks/use-categories"
import { NumericFormat, PatternFormat } from "react-number-format"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  category: z.string().min(1, "A categoria é obrigatória."),
  homeTeamId: z.string().min(1, "O time da casa é obrigatório."),
  awayTeamId: z.string().min(1, "O time visitante é obrigatório."),
  betAmount: z.number().min(0.01, "O valor da aposta deve ser positivo."),
  initialPrize: z.number().min(0, "O prêmio não pode ser negativo."),
  matchDate: z.date({ required_error: "A data da partida é obrigatória." }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
  closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
})

type BolaoFormValues = z.infer<typeof formSchema>

interface BolaoFormModalProps {
  bolao?: Bolao | null
  onSave: (data: any, id?: string) => void
  children: React.ReactNode
}

export function BolaoFormModal({
  bolao,
  onSave,
  children,
}: BolaoFormModalProps) {
  const [open, setOpen] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const { categories, loading: categoriesLoading } = useCategories(true)
  const { toast } = useToast()

  const form = useForm<BolaoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: bolao?.category || "",
      homeTeamId: bolao?.homeTeamId || "",
      awayTeamId: bolao?.awayTeamId || "",
      betAmount: bolao?.value || 0,
      initialPrize: bolao?.initialPrize || 0,
      matchDate: bolao?.matchDate ? new Date(bolao.matchDate) : undefined,
      startTime: bolao?.matchDate ? format(new Date(bolao.matchDate), "HH:mm") : "",
      endTime: bolao?.endDate ? format(new Date(bolao.endDate), "HH:mm") : "",
      closingTime: bolao?.closingTime ? format(new Date(bolao.closingTime), "HH:mm") : "",
    },
  })

  // Destructure reset from form to use in dependency array
  const { reset } = form;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const allTeams = await getTeams()
        setTeams(allTeams)
      } catch (err) {
        toast({
          title: "Erro ao buscar times",
          variant: "destructive",
        })
      }
    }
    fetchInitialData()
  }, [toast])
  
  useEffect(() => {
    if(bolao) {
      reset({
        category: bolao.category || "",
        homeTeamId: bolao.homeTeamId || "",
        awayTeamId: bolao.awayTeamId || "",
        betAmount: bolao.value || 0,
        initialPrize: bolao.initialPrize || 0,
        matchDate: bolao.matchDate ? new Date(bolao.matchDate) : undefined,
        startTime: bolao.matchDate ? format(new Date(bolao.matchDate), "HH:mm") : "",
        endTime: bolao.endDate ? format(new Date(bolao.endDate), "HH:mm") : "",
        closingTime: bolao.closingTime ? format(new Date(bolao.closingTime), "HH:mm") : "",
      })
    } else {
      reset({
        category: "",
        homeTeamId: "",
        awayTeamId: "",
        betAmount: 0,
        initialPrize: 0,
        matchDate: undefined,
        startTime: "",
        endTime: "",
        closingTime: "",
      })
    }
  }, [bolao, reset])


  const onSubmit = (data: BolaoFormValues) => {
    const { matchDate, startTime, endTime, closingTime, ...rest } = data

    const parseTime = (timeStr: string) => parse(timeStr, "HH:mm", new Date())
    const startDateTime = new Date(matchDate)
    const endDateTime = new Date(matchDate)
    const closingDateTime = new Date(matchDate)

    const startTimeDate = parseTime(startTime)
    startDateTime.setHours(startTimeDate.getHours(), startTimeDate.getMinutes())

    const endTimeDate = parseTime(endTime)
    endDateTime.setHours(endTimeDate.getHours(), endTimeDate.getMinutes())

    const closingTimeDate = parseTime(closingTime)
    closingDateTime.setHours(closingTimeDate.getHours(), closingTimeDate.getMinutes())

    const finalData = {
      ...rest,
      matchDate: startDateTime,
      endDate: endDateTime,
      closingTime: closingDateTime,
      value: rest.betAmount,
    }

    onSave(finalData, bolao?.id)
    setOpen(false)
  }

  const flattenCategories = useMemo(() => {
    const flatList: { label: string; value: string }[] = []
    const traverse = (cats: Category[], level = 0) => {
        for (const cat of cats) {
            flatList.push({
                label: `${"—".repeat(level)} ${cat.name}`,
                value: cat.id,
            })
            if (cat.children && cat.children.length > 0) {
                traverse(cat.children, level + 1)
            }
        }
    }
    traverse(categories);
    return flatList;
  }, [categories]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{bolao ? "Editar Bolão" : "Criar Novo Bolão"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para criar ou editar um bolão.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Nenhuma</SelectItem>
                      {flattenCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="homeTeamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time da Casa</FormLabel>
                    <TeamSelector teams={teams} field={field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="awayTeamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Visitante</FormLabel>
                    <TeamSelector teams={teams} field={field} otherTeamId={form.getValues("homeTeamId")} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="betAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Aposta (R$)</FormLabel>
                    <FormControl>
                       <NumericFormat 
                        customInput={Input} 
                        thousandSeparator="." 
                        decimalSeparator="," 
                        prefix="R$ " 
                        value={field.value} 
                        onValueChange={(values) => field.onChange(values.floatValue || 0)}
                        onBlur={field.onBlur}
                        getInputRef={field.ref}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="initialPrize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prêmio Inicial (R$)</FormLabel>
                     <FormControl>
                       <NumericFormat 
                        customInput={Input} 
                        thousandSeparator="." 
                        decimalSeparator="," 
                        prefix="R$ " 
                        value={field.value} 
                        onValueChange={(values) => field.onChange(values.floatValue || 0)}
                        onBlur={field.onBlur}
                        getInputRef={field.ref}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

             <FormField
                control={form.control}
                name="matchDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Partida</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início</FormLabel>
                    <FormControl>
                      <PatternFormat 
                        format="##:##" 
                        placeholder="HH:MM" 
                        customInput={Input} 
                        value={field.value}
                        onValueChange={(values) => field.onChange(values.formattedValue)}
                        onBlur={field.onBlur}
                        getInputRef={field.ref}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fim</FormLabel>
                    <FormControl>
                      <PatternFormat 
                        format="##:##" 
                        placeholder="HH:MM" 
                        customInput={Input} 
                        value={field.value}
                        onValueChange={(values) => field.onChange(values.formattedValue)}
                        onBlur={field.onBlur}
                        getInputRef={field.ref}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="closingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">Limite de Apostas</FormLabel>
                    <FormControl>
                      <PatternFormat 
                        format="##:##" 
                        placeholder="HH:MM" 
                        customInput={Input} 
                        value={field.value}
                        onValueChange={(values) => field.onChange(values.formattedValue)}
                        onBlur={field.onBlur}
                        getInputRef={field.ref}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
               <Button type="submit">{form.formState.isSubmitting ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


const TeamSelector = ({ teams, field, otherTeamId }: { teams: Team[], field: any, otherTeamId?: string }) => {
  const [open, setOpen] = useState(false)
  const filteredTeams = teams.filter(team => team.id !== otherTeamId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value
              ? teams.find(team => team.id === field.value)?.name
              : "Selecione o time"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
        <Command>
          <CommandInput placeholder="Pesquisar time..." />
          <CommandList>
            <CommandEmpty>Nenhum time encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredTeams.map(team => (
                <CommandItem
                  value={team.name}
                  key={team.id}
                  onSelect={() => {
                    field.onChange(team.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      team.id === field.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {team.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

    