"use client";

import { useState, useEffect } from "react";
import { format, isValid } from "date-fns";
import { Calendar as CalendarIcon, Clock, ChevronsUpDown, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Bolao, Team } from "@/types";
import { getTeams } from "@/services/teams";
import { getAllCategories, Category } from "@/services/categories";
import { PatternFormat, NumericFormat } from 'react-number-format';
import { cn } from "@/lib/utils";

const toDateSafe = (date: any): Date | undefined => {
    if (!date) return undefined;
    // @ts-ignore
    if (typeof date.toDate === 'function') return date.toDate();
    const d = new Date(date);
    return isValid(d) ? d : undefined;
};

interface BolaoFormModalProps {
  bolao?: Bolao | null;
  onSave: (data: Omit<Bolao, "id" | "status">, id?: string) => void;
  children: React.ReactNode;
}

const initialFormData = {
  homeTeamId: "",
  awayTeamId: "",
  matchDate: undefined,
  startTime: "",
  endTime: "",
  closingTime: "",
  betAmount: 0,
  initialPrize: 0,
};

export function BolaoFormModal({
  bolao,
  onSave,
  children,
}: BolaoFormModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>(initialFormData);
  const [teams, setTeams] = useState<Team[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [homeTeamPopoverOpen, setHomeTeamPopoverOpen] = useState(false);
  const [awayTeamPopoverOpen, setAwayTeamPopoverOpen] = useState(false);

  const isEditing = !!bolao;

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const [allTeams, fetchedCategories] = await Promise.all([
            getTeams(),
            getAllCategories(),
          ]);
          setTeams(allTeams);
          setAllCategories(fetchedCategories);

          setFormData(initialFormData);
          setCategoryPath([]);

          if (isEditing && bolao) {
            const matchStartDate = toDateSafe(bolao.matchStartDate);
            const matchEndDate = toDateSafe(bolao.matchEndDate);
        
            let formattedClosingTime = "";
            if (bolao.closingTime) {
                const parsedClosingTime = toDateSafe(bolao.closingTime);
                if (parsedClosingTime) {
                    formattedClosingTime = format(parsedClosingTime, "HH:mm");
                }
            }

            setFormData({
              homeTeamId: bolao.homeTeam.id,
              awayTeamId: bolao.awayTeam.id,
              matchDate: matchStartDate,
              startTime: matchStartDate ? format(matchStartDate, "HH:mm") : "",
              endTime: matchEndDate ? format(matchEndDate, "HH:mm") : "",
              closingTime: formattedClosingTime,
              betAmount: parseFloat(String(bolao.betAmount)) || 0,
              initialPrize: parseFloat(String(bolao.initialPrize)) || 0,
            });
            
            if (bolao.categoryIds && bolao.categoryIds.length > 0) {
                const path: string[] = [];
                const buildPath = (id: string | null) => {
                    if(!id) return;
                    const cat = fetchedCategories.find(c => c.id === id);
                    if (cat) {
                        buildPath(cat.parentId);
                        path.push(cat.id);
                    }
                }
                const leafId = bolao.categoryIds.find(id => !fetchedCategories.some(c => c.parentId === id));
                if (leafId) {
                    buildPath(leafId);
                }
                setCategoryPath(path);
            }
          }
        } catch (err) {
          console.error("Error fetching data in BolaoFormModal:", err);
          setError("Erro ao carregar dados. Tente novamente.");
        }
      };
      
      fetchData();
    }
  }, [open, isEditing, bolao]);
  
  const handleCategoryChange = (index: number, value: string) => {
    const newPath = categoryPath.slice(0, index);
    newPath.push(value);
    setCategoryPath(newPath);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const { matchDate, startTime, endTime, closingTime, ...rest } = formData;
    
    if (!matchDate || !startTime || !endTime || !closingTime || categoryPath.length === 0) {
        setError("Todos os campos são obrigatórios, incluindo a seleção completa da categoria.");
        return;
    }

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const matchStartDate = new Date(matchDate);
    matchStartDate.setHours(startHours, startMinutes);
    const matchEndDate = new Date(matchDate);
    matchEndDate.setHours(endHours, endMinutes);

    const [closingHours, closingMinutes] = closingTime.split(':').map(Number);
    const finalClosingTime = new Date(matchDate); 
    finalClosingTime.setHours(closingHours, closingMinutes, 0, 0); 
    
    const finalData = {
        ...rest,
        matchStartDate,
        matchEndDate,
        closingTime: finalClosingTime, 
        homeTeam: teams.find(t => t.id === formData.homeTeamId)!,
        awayTeam: teams.find(t => t.id === formData.awayTeamId)!,
        categoryIds: categoryPath,
    };
    
    onSave(finalData, isEditing ? bolao!.id : undefined);
    setOpen(false);
  };

  const renderCategorySelectors = () => {
    const selectors = [];
    selectors.push(
      <Select
        key="category-level-0"
        value={categoryPath[0] || ""}
        onValueChange={(value) => handleCategoryChange(0, value)}
      >
        <SelectTrigger><SelectValue placeholder="Categoria Principal" /></SelectTrigger>
        <SelectContent>
          {allCategories.filter(c => c.parentId === null).map(c => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );

    for (let i = 0; i < categoryPath.length; i++) {
      const parentId = categoryPath[i];
      const children = allCategories.filter(c => c.parentId === parentId);
      
      if (children.length > 0) {
        selectors.push(
          <Select
            key={`category-level-${i + 1}`}
            value={categoryPath[i + 1] || ""}
            onValueChange={(value) => handleCategoryChange(i + 1, value)}
          >
            <SelectTrigger><SelectValue placeholder={`Subcategoria`} /></SelectTrigger>
            <SelectContent>
              {children.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
    }
    return selectors;
  };

  const TeamSelector = ({ value, onSelect, otherTeamId, placeholder, open, onOpenChange }: any) => (
    <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                {value ? teams.find(t => t.id === value)?.name : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0 z-[100]">
            <Command>
                <CommandInput placeholder="Pesquisar time..." />
                <CommandList>
                    <CommandEmpty>Nenhum time encontrado.</CommandEmpty>
                    <CommandGroup>
                        {teams.filter(t => t.id !== otherTeamId).map((team) => (
                            <CommandItem
                                key={team.id}
                                value={team.name} // Use name for search, but select with id
                                onSelect={() => {
                                    onSelect(team.id)
                                    onOpenChange(false)
                                }}
                            >
                                <Check className={cn("mr-2 h-4 w-4", value === team.id ? "opacity-100" : "opacity-0")} />
                                {team.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
  );
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Bolão" : "Criar Novo Bolão"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">

            <div className="col-span-2 space-y-2 p-3 border rounded-md bg-muted/20">
                <Label>Categorias</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {renderCategorySelectors()}
                </div>
            </div>

            <div>
                <Label>Time da Casa</Label>
                <TeamSelector 
                    value={formData.homeTeamId}
                    onSelect={(value: string) => setFormData({...formData, homeTeamId: value})}
                    otherTeamId={formData.awayTeamId}
                    placeholder="Selecione o Time da Casa"
                    open={homeTeamPopoverOpen}
                    onOpenChange={setHomeTeamPopoverOpen}
                />
            </div>
            <div>
                <Label>Time Visitante</Label>
                <TeamSelector 
                    value={formData.awayTeamId}
                    onSelect={(value: string) => setFormData({...formData, awayTeamId: value})}
                    otherTeamId={formData.homeTeamId}
                    placeholder="Selecione o Time Visitante"
                    open={awayTeamPopoverOpen}
                    onOpenChange={setAwayTeamPopoverOpen}
                />
            </div>
            <div><Label>Valor da Aposta (R$)</Label><NumericFormat customInput={Input} thousandSeparator="." decimalSeparator="," prefix="R$ " value={formData.betAmount} onValueChange={(values) => setFormData({...formData, betAmount: values.floatValue || 0})}/></div>
            <div><Label>Prêmio Inicial (R$)</Label><NumericFormat customInput={Input} thousandSeparator="." decimalSeparator="," prefix="R$ " value={formData.initialPrize} onValueChange={(values) => setFormData({...formData, initialPrize: values.floatValue || 0})}/></div>
            <div><Label>Data da Partida</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!formData.matchDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formData.matchDate ? format(formData.matchDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.matchDate} onSelect={(date) => setFormData({...formData, matchDate: date})} initialFocus/></PopoverContent></Popover></div>
            
            <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                <div>
                    <Label>Início da Partida</Label>
                    <PatternFormat 
                        customInput={Input} 
                        format="##:##" 
                        placeholder="HH:MM" 
                        value={formData.startTime}
                        onValueChange={(values) => setFormData({...formData, startTime: values.formattedValue})}
                    />
                </div>
                <div>
                    <Label>Fim da Partida</Label>
                    <PatternFormat 
                        customInput={Input} 
                        format="##:##" 
                        placeholder="HH:MM" 
                        value={formData.endTime} 
                        onValueChange={(values) => setFormData({...formData, endTime: values.formattedValue})}
                    />
                </div>
                <div>
                    <Label className="flex items-center gap-1 text-primary font-semibold">
                        <Clock className="h-4 w-4" />
                        Limite para Apostas
                    </Label>
                    <PatternFormat 
                        customInput={Input} 
                        format="##:##" 
                        placeholder="HH:MM" 
                        value={formData.closingTime}
                        onValueChange={(values) => setFormData({...formData, closingTime: values.formattedValue})}
                    />
                </div>
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
  );
}
