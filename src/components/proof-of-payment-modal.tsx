
"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Paperclip, MessageCircle } from "lucide-react"

interface ProofOfPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onWhatsappRedirect: () => void
}

export function ProofOfPaymentModal({ isOpen, onClose, onWhatsappRedirect }: ProofOfPaymentModalProps) {
  const { toast } = useToast()

  const handleAttachReceipt = () => {
    // A lógica de upload de arquivo pode ser adicionada aqui no futuro.
    // Por enquanto, podemos usar um input de arquivo ou apenas notificar o usuário.
    toast({
      title: "Função em desenvolvimento",
      description: "Por enquanto, por favor, envie seu comprovante pelo WhatsApp.",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Enviar Comprovante</DialogTitle>
          <DialogDescription className="text-center">
            Para acelerar a aprovação da sua recarga, por favor, envie o comprovante de pagamento.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-6 flex flex-col gap-4">
            <Button onClick={onWhatsappRedirect} variant="success" size="lg" className="h-14 text-lg">
                <MessageCircle className="mr-2 h-6 w-6" />
                Enviar pelo WhatsApp
            </Button>
            <Button onClick={handleAttachReceipt} variant="outline" size="lg" className="h-14 text-lg">
                <Paperclip className="mr-2 h-6 w-6" />
                Anexar Comprovante
            </Button>
        </div>

        <DialogFooter>
            <Button onClick={onClose} variant="ghost" className="w-full">
                Fechar
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
