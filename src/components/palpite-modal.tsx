
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { createTransaction } from "@/services/transactions"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

import { Bolao } from "@/services/boloes"

const palpiteSchema = z.object({
  scoreTeam1: z.number().min(0, "O placar deve ser no mínimo 0."),
  scoreTeam2: z.number().min(0, "O placar deve ser no mínimo 0."),
  comment: z.string().max(80, "O comentário não pode ter mais de 80 caracteres.").optional(),
})

type PalpiteFormValues = z.infer<typeof palpiteSchema>

interface PalpiteModalProps {
  isOpen: boolean
  onClose: () => void
  bolao: Bolao & { teamADetails?: any; teamBDetails?: any }
}

export function PalpiteModal({ isOpen, onClose, bolao }: PalpiteModalProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PalpiteFormValues>({
    resolver: zodResolver(palpiteSchema),
    defaultValues: {
      scoreTeam1: 0,
      scoreTeam2: 0,
      comment: "",
    },
  })

  const onSubmit = async (values: PalpiteFormValues) => {
    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Você precisa estar logado para chutar.", variant: "destructive" })
      return router.push("/login")
    }

    setIsSubmitting(true)
    try {
      const palpiteRef = doc(collection(db, "palpites"))
      
      // Criação da transação de débito
      await createTransaction({
        uid: user.uid,
        type: 'bet_placement',
        amount: -bolao.fee, // Valor negativo para débito
        description: `Aposta no bolão: ${bolao.name}`,
        status: 'pending', // A transação fica pendente até o comprovante
        metadata: { 
            bolaoId: bolao.id,
            palpiteId: palpiteRef.id,
         },
      });

      // Criação do palpite
      await setDoc(palpiteRef, {
        id: palpiteRef.id,
        userId: user.uid,
        bolaoId: bolao.id,
        scoreTeam1: values.scoreTeam1,
        scoreTeam2: values.scoreTeam2,
        comment: values.comment || "",
        createdAt: serverTimestamp(),
        status: "Pendente",
        receiptUrl: "", 
      })
      
      toast({
        title: "Palpite Confirmado!",
        description: "Agora vá para 'Meus Chutes' para enviar o comprovante e validar sua aposta.",
        variant: "success",
      })
      
      onClose()
      router.push("/meus-chutes")
      
    } catch (error) {
      console.error("Erro ao salvar o palpite:", error)
      toast({ title: "Ops! Algo deu errado.", description: "Não foi possível registrar seu palpite. Tente novamente.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Faça seu Chute</DialogTitle>
          <DialogDescription>
            Defina o placar e, se quiser, deixe um comentário para a torcida!
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-around space-x-4">
               <FormField
                control={form.control}
                name="scoreTeam1"
                render={({ field }) => (
                  <FormItem className="flex-1 text-center">
                    <FormLabel className="text-lg font-semibold">{bolao.teamADetails?.name}</FormLabel>
                    <FormControl><Input type="number" className="text-center text-2xl h-16" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl>
                  </FormItem>
                )}
              />
              <div className="text-2xl font-bold text-muted-foreground pt-8">X</div>
              <FormField
                control={form.control}
                name="scoreTeam2"
                render={({ field }) => (
                  <FormItem className="flex-1 text-center">
                    <FormLabel className="text-lg font-semibold">{bolao.teamBDetails?.name}</FormLabel>
                    <FormControl><Input type="number" className="text-center text-2xl h-16" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem><FormLabel>Comentário (Opcional)</FormLabel><FormControl><Textarea placeholder="Ex: Hoje vai ser de lavada! Rumo à vitória!" className="resize-none" maxLength={80} {...field}/></FormControl><FormMessage /></FormItem>
              )}
            />
             <div className="text-sm text-center text-muted-foreground p-3 bg-muted/20 rounded-md">
              <p>Valor da aposta: <span className="font-bold text-foreground">{bolao.fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Confirmando..." : "Confirmar Chute"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
