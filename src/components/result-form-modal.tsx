
"use client"

import { useState } from "react"
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
import { Bolao } from "@/services/boloes"
import { updateBolao } from "@/services/boloes"
import { getPalpitesByBolaoId } from "@/services/palpites"
import { createTransaction } from "@/services/transactions" // Corrigido aqui
import { useToast } from "@/hooks/use-toast"

interface ResultFormModalProps {
  bolao: Bolao & { teamA: string; teamB: string }
  onResultSubmitted: () => void
  children: React.ReactNode
}

export function ResultFormModal({ bolao, onResultSubmitted, children }: ResultFormModalProps) {
  const [open, setOpen] = useState(false)
  const [scoreTeam1, setScoreTeam1] = useState("")
  const [scoreTeam2, setScoreTeam2] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const finalScore1 = parseInt(scoreTeam1, 10)
    const finalScore2 = parseInt(scoreTeam2, 10)

    if (isNaN(finalScore1) || isNaN(finalScore2)) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, insira um placar válido.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      await updateBolao(bolao.id, {
        scoreTeam1: finalScore1,
        scoreTeam2: finalScore2,
        status: "Finalizado",
      })

      const palpites = await getPalpitesByBolaoId(bolao.id)
      const winners = palpites.filter(
        p => p.scoreTeam1 === finalScore1 && p.scoreTeam2 === finalScore2 && p.status === "Aprovado"
      )

      if (winners.length > 0) {
        const approvedPalpitesCount = palpites.filter(p => p.status === "Aprovado").length
        const totalCollected = bolao.fee * approvedPalpitesCount
        const totalPrize = (bolao.initialPrize || 0) + totalCollected * 0.9
        const prizePerWinner = totalPrize / winners.length

        const transactionPromises = winners.map(winner =>
          createTransaction({ // Corrigido aqui
            uid: winner.userId,
            type: "prize_winning",
            amount: prizePerWinner,
            description: `Prêmio do bolão: ${bolao.name}`,
            status: "completed",
            metadata: { 
                bolaoId: bolao.id,
                palpiteId: winner.id,
             },
          })
        )
        await Promise.all(transactionPromises)
        
        toast({
            title: "Resultado Registrado!",
            description: `${winners.length} ganhador(es) foram premiados com R$ ${prizePerWinner.toFixed(2)} cada.`,
            variant: "success",
        })

      } else {
        toast({
            title: "Resultado Registrado!",
            description: "Nenhum ganhador para este bolão.",
        })
      }

      onResultSubmitted()
      setOpen(false)

    } catch (error) {
      console.error("Erro ao registrar resultado: ", error)
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível registrar o resultado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Resultado</DialogTitle>
          </DialogHeader>
          <div className="py-4 grid grid-cols-2 gap-4 items-center">
            <Label htmlFor="score1" className="text-right">
              {bolao.teamA}
            </Label>
            <Input
              id="score1"
              type="number"
              value={scoreTeam1}
              onChange={e => setScoreTeam1(e.target.value)}
              className="col-span-1"
              disabled={isSubmitting}
            />
             <Label htmlFor="score2" className="text-right">
              {bolao.teamB}
            </Label>
            <Input
              id="score2"
              type="number"
              value={scoreTeam2}
              onChange={e => setScoreTeam2(e.target.value)}
              className="col-span-1"
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Resultado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
