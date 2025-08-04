
"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, isValid, parse } from "date-fns"
import {
  Calendar as CalendarIcon,
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
import { Category, getAllCategories } from "@/services/categories"
import { NumericFormat, PatternFormat } from "react-number-format"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  categoryIds: z.array(z.string()).refine(value => value.length > 0, {
    message: "Pelo menos uma categoria é obrigatória.",
  }),
  homeTeamId: z.string().min(1, "O time da casa é obrigatório."),
  awayTeamId: z.string().min(1, "O time visitante é obrigatório."),
  betAmount: z.number().min(0.01, "O valor da aposta deve ser positivo."),
  initialPrize: z.number().min(0, "O prêmio não pode ser negativo."),
  matchDate: z.date({ required_error: "A data da partida é obrigatória." }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
  closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)."),
}).refine(data => data.homeTeamId !== data.awayTeamId, {
  message: "O time da casa não pode ser igual ao visitante.",
  path: ["awayTeamId"],
});


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
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const { toast } = useToast()

  const form = useForm<BolaoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryIds: bolao?.categoryIds || [],
      homeTeamId: bolao?.homeTeam?.id || "",
      awayTeamId: bolao?.awayTeam?.id || "",
      betAmount: bolao?.betAmount || 0,
      initialPrize: bolao?.initialPrize || 0,
      matchDate: bolao?.matchStartDate && isValid(new Date(bolao.matchStartDate)) ? new Date(bolao.matchStartDate) : undefined,
      startTime: bolao?.matchStartDate && isValid(new Date(bolao.matchStartDate)) ? format(new Date(bolao.matchStartDate), "HH:mm") : "",
      closingTime: bolao?.closingTime && isValid(new Date(bolao.closingTime)) ? format(new Date(bolao.closingTime), "HH:mm") : "",
    },
  })

  const { reset, watch } = form;
  const homeTeamId = watch("homeTeamId");

  useEffect(() => {
    if (!open) return;

    const fetchInitialData = async () => {
      try {
        setCategoriesLoading(true);
        const [allTeams, allCategories] = await Promise.all([
          getTeams(),
          getAllCategories(true) // Fetch all, including inactive
        ]);
        setTeams(allTeams);
        setCategories(allCategories);
      } catch (err) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível buscar times e categorias.",
          variant: "destructive",
        })
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchInitialData()
  }, [open, toast])
  
  useEffect(() => {
    if(bolao) {
      reset({
        categoryIds: bolao.categoryIds || [],
        homeTeamId: bolao.homeTeam?.id || "",
        awayTeamId: bolao.awayTeam?.id || "",
        betAmount: bolao.betAmount || 0,
        initialPrize: bolao.initialPrize || 0,
        matchDate: bolao.matchStartDate && isValid(new Date(bolao.matchStartDate)) ? new Date(bolao.matchStartDate) : undefined,
        startTime: bolao.matchStartDate && isValid(new Date(bolao.matchStartDate)) ? format(new Date(bolao.matchStartDate), "HH:mm") : "",
        closingTime: bolao.closingTime && isValid(new Date(bolao.closingTime)) ? format(new Date(bolao.closingTime), "HH:mm") : "",
      })
    } else {
      reset({
        categoryIds: [],
        homeTeamId: "",
        awayTeamId: "",
        betAmount: 0,
        initialPrize: 0,
        matchDate: undefined,
        startTime: "",
        closingTime: "",
      })
    }
  }, [bolao, reset])


  const onSubmit = (data: BolaoFormValues) => {
    const { matchDate, startTime, closingTime, ...rest } = data

    const parseTime = (timeStr: string) => parse(timeStr, "HH:mm", new Date())
    
    const startDateTime = new Date(matchDate)
    const startTimeDate = parseTime(startTime)
    startDateTime.setHours(startTimeDate.getHours(), startTimeDate.getMinutes())

    const closingDateTime = new Date(matchDate)
    const closingTimeDate = parseTime(closingTime)
    closingDateTime.setHours(closingTimeDate.getHours(), closingTimeDate.getMinutes())

    const finalData = {
      ...rest,
      matchStartDate: startDateTime,
      closingTime: closingDateTime,
    }

    onSave(finalData, bolao?.id)
    setOpen(false)
  }

  const flattenCategories = useMemo(() => {
    const flatList: { label: string; value: string }[] = []
    const traverse = (cats: Category[], level = 0) => {
        for (const cat of cats) {
            flatList.push({
                label: `${'—'.repeat(level)} ${cat.name}`.trim(),
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
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                   <Select
                    onValueChange={(value) => field.onChange(value ? [value] : [])} // Assuming single category selection for now
                    value={field.value?.[0] || ""}
                    disabled={categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
                    <TeamSelector teams={teams} field={field} otherTeamId={homeTeamId} />
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
                        name={field.name}
                        ref={field.ref}
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
                        name={field.name}
                        ref={field.ref}
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
                            {field.value && isValid(field.value) ? (
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início da Partida</FormLabel>
                    <FormControl>
                      <PatternFormat 
                        format="##:##" 
                        placeholder="HH:MM" 
                        customInput={Input} 
                        value={field.value}
                        onValueChange={(values) => field.onChange(values.formattedValue)}
                        onBlur={field.onBlur}
                        name={field.name}
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
                    <FormLabel className="text-primary">Encerramento das Apostas</FormLabel>
                    <FormControl>
                      <PatternFormat 
                        format="##:##" 
                        placeholder="HH:MM" 
                        customInput={Input} 
                        value={field.value}
                        onValueChange={(values) => field.onChange(values.formattedValue)}
                        onBlur={field.onBlur}
                        name={field.name}
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
