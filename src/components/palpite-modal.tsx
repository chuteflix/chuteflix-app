"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { placeChute } from "@/services/palpites"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Bolao } from "@/types"

const formSchema = z.object({
  scoreTeam1: z.coerce.number().min(0, "O placar não pode ser negativo."),
  scoreTeam2: z.coerce.number().min(0, "O placar não pode ser negativo."),
  comment: z.string().max(280, "O comentário não pode ter mais de 280 caracteres.").optional(),
})

interface PalpiteModalProps {
  isOpen: boolean
  onClose: () => void
  bolao: Bolao
}

export function PalpiteModal({ isOpen, onClose, bolao }: PalpiteModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scoreTeam1: 0,
      scoreTeam2: 0,
      comment: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      await placeChute(
        bolao.id,
        values.scoreTeam1,
        values.scoreTeam2,
        bolao.betAmount,
        values.comment
      )
      toast({
        title: "Palpite Enviado!",
        description: "Seu chute foi registrado com sucesso. Boa sorte!",
        variant: "default",
      })
      onClose()
      form.reset() // Limpa o formulário após o sucesso
    } catch (error: any) {
      toast({
        title: "Erro ao Enviar Palpite",
        description: error.message || "Não foi possível registrar seu chute. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // O hook useMediaQuery executa apenas no cliente.
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (!isOpen) {
    return null
  }
  
  const PalpiteForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 md:p-0">
        <div className="flex items-center justify-center gap-4">
          <FormField
            control={form.control}
            name="scoreTeam1"
            render={({ field }) => (
              <FormItem className="w-24 text-center">
                <FormLabel>{bolao.homeTeam.name}</FormLabel>
                <FormControl>
                  <Input type="number" className="text-2xl font-bold text-center h-16" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <span className="text-2xl font-bold text-muted-foreground pt-8">x</span>
           <FormField
            control={form.control}
            name="scoreTeam2"
            render={({ field }) => (
              <FormItem className="w-24 text-center">
                <FormLabel>{bolao.awayTeam.name}</FormLabel>
                <FormControl>
                  <Input type="number" className="text-2xl font-bold text-center h-16" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adicionar um comentário (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex: Acredito na vitória do time da casa!"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        <div className="text-sm text-center text-muted-foreground p-3 bg-muted/20 rounded-md">
          <p>Valor da aposta: <span className="font-bold text-foreground">{bolao.betAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
        </div>
        <DialogFooter className="md:flex md:items-center md:justify-end gap-2 pt-0">
            {/* O DrawerClose é usado no mobile, o Dialog usa o onOpenChange */}
            <DrawerClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            </DrawerClose>
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Confirmando..." : "Confirmar Chute"}
            </Button>
        </DialogFooter>
      </form>
    </Form>
  )

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Faça seu Palpite</DialogTitle>
            <DialogDescription>
              Insira o placar para {bolao.homeTeam.name} vs {bolao.awayTeam.name}.
            </DialogDescription>
          </DialogHeader>
          {PalpiteForm}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Faça seu Palpite</DrawerTitle>
          <DrawerDescription>
            Insira o placar para {bolao.homeTeam.name} vs {bolao.awayTeam.name}.
          </DrawerDescription>
        </DrawerHeader>
        {PalpiteForm}
      </DrawerContent>
    </Drawer>
  )
}
