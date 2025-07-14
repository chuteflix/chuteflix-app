
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Bolao } from "@/services/boloes"
import { updateBolao } from "@/services/boloes"
import { getPalpitesByBolaoId } from "@/services/palpites"
import { createTransaction, updateTransactionStatusByPalpiteId } from "@/services/transactions"
import { updateUserBalance } from "@/services/users"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const resultSchema = z.object({
    scoreTeam1: z.number().min(0),
    scoreTeam2: z.number().min(0),
    winningTeamId: z.string({ required_error: "É obrigatório definir o vencedor." }),
});

type ResultFormValues = z.infer<typeof resultSchema>;

interface ResultFormModalProps {
  bolao: Bolao & { teamA: string; teamB: string }
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

  const onSubmit = async (values: ResultFormValues) => {
    setIsSubmitting(true)

    try {
      await updateBolao(bolao.id, {
        scoreTeam1: values.scoreTeam1,
        scoreTeam2: values.scoreTeam2,
        winningTeamId: values.winningTeamId,
        status: "Finalizado",
      })

      const approvedPalpites = await getPalpitesByBolaoId(bolao.id, "Aprovado")
      if (approvedPalpites.length === 0) {
        toast({ title: "Resultado Registrado!", description: "Nenhum palpite aprovado para este bolão.", variant: "info" })
        onResultSubmitted()
        setOpen(false)
        return
      }

      const winners = approvedPalpites.filter(
        p => p.scoreTeam1 === values.scoreTeam1 && p.scoreTeam2 === values.scoreTeam2 && p.predictedWinner === values.winningTeamId
      )

      if (winners.length > 0) {
        const totalCollected = bolao.fee * approvedPalpites.length
        const totalPrize = (bolao.initialPrize || 0) + totalCollected * 0.9
        const prizePerWinner = totalPrize / winners.length

        for (const winner of winners) {
          await updateTransactionStatusByPalpiteId(winner.id, "completed");
          await createTransaction({
            uid: winner.userId,
            type: "prize_winning",
            amount: prizePerWinner,
            description: `Prêmio do bolão: ${bolao.name}`,
            status: "completed",
            metadata: { bolaoId: bolao.id, palpiteId: winner.id },
          })
          await updateUserBalance(winner.userId, prizePerWinner)
        }
        
        toast({
            title: "Resultado Registrado!",
            description: `${winners.length} ganhador(es) foram premiados com R$ ${prizePerWinner.toFixed(2)} cada.`,
            variant: "success",
        })

      } else {
        toast({
            title: "Resultado Registrado!",
            description: "Nenhum ganhador para este bolão.",
            variant: "info",
        })
      }

      onResultSubmitted()
      setOpen(false)

    } catch (error) {
      console.error("Erro ao registrar resultado: ", error)
      toast({ title: "Erro ao Salvar", description: "Não foi possível registrar o resultado. Tente novamente.", variant: "destructive" })
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
                        <FormItem className="flex-1 text-center"><FormLabel>{bolao.teamA}</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl></FormItem>
                    )}/>
                    <div className="pt-8">X</div>
                    <FormField control={form.control} name="scoreTeam2" render={({ field }) => (
                        <FormItem className="flex-1 text-center"><FormLabel>{bolao.teamB}</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl></FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="winningTeamId" render={({ field }) => (
                    <FormItem className="space-y-2"><FormLabel>Time Vencedor</FormLabel>
                        <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value={bolao.teamAId} /></FormControl><FormLabel className="font-normal">{bolao.teamA}</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="draw" /></FormControl><FormLabel className="font-normal">Empate</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value={bolao.teamBId} /></FormControl><FormLabel className="font-normal">{bolao.teamB}</FormLabel></FormItem>
                        </RadioGroup>
                        </FormControl><FormMessage />
                    </FormItem>
                )}/>
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
