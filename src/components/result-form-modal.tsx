"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Bolao } from "@/types"
// Importa a função centralizada que faz todo o trabalho pesado
import { setResultAndProcessPalpites } from "@/services/palpites" 
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const resultSchema = z.object({
    scoreTeam1: z.number().min(0, "O placar deve ser um número positivo."),
    scoreTeam2: z.number().min(0, "O placar deve ser um número positivo."),
});

type ResultFormValues = z.infer<typeof resultSchema>;

interface ResultFormModalProps {
  bolao: Bolao; 
  onResultSubmitted: () => void
  children: React.ReactNode
}

export function ResultFormModal({ bolao, onResultSubmitted, children }: ResultFormModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
        scoreTeam1: 0,
        scoreTeam2: 0,
    },
  });

  // A lógica de onSubmit foi drasticamente simplificada
  const onSubmit = async (values: ResultFormValues) => {
    setIsSubmitting(true)
    try {
      // 1. Delega toda a lógica para a função de serviço
      await setResultAndProcessPalpites(bolao.id, values.scoreTeam1, values.scoreTeam2);
      
      // 2. Exibe uma mensagem de sucesso genérica
      toast({
        title: "Operação Concluída!",
        description: "O resultado do bolão foi registrado e os prêmios foram processados.",
        variant: "default",
      });

      // 3. Fecha o modal e atualiza a lista de bolões
      onResultSubmitted();
      setOpen(false);

    } catch (error: any) {
      console.error("Erro ao registrar resultado: ", error)
      toast({ 
        title: "Erro ao Salvar", 
        description: error.message || "Não foi possível registrar o resultado. Tente novamente.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if(!isOpen) form.reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Registrar Resultado</DialogTitle></DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-around space-x-4">
                    <FormField control={form.control} name="scoreTeam1" render={({ field }) => (
                        <FormItem className="flex-1 text-center">
                            <FormLabel className="font-semibold">{bolao.homeTeam.name}</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl>
                        </FormItem>
                    )}/>
                    <div className="pt-8 font-bold">X</div>
                    <FormField control={form.control} name="scoreTeam2" render={({ field }) => (
                        <FormItem className="flex-1 text-center">
                            <FormLabel className="font-semibold">{bolao.awayTeam.name}</FormLabel>
                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl>
                        </FormItem>
                    )}/>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : null}
                        {isSubmitting ? "Processando..." : "Salvar Resultado e Pagar Prêmios"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
