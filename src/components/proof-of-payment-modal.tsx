
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Paperclip, MessageCircle, Loader2 } from "lucide-react"
import { uploadFile } from "@/services/storage" // 1. Corrigido para usar uploadFile
import { updateTransaction } from "@/services/transactions"
import { useAuth } from "@/context/auth-context" // Importar useAuth

interface ProofOfPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onWhatsappRedirect: () => void
  transactionId: string
}

export function ProofOfPaymentModal({ isOpen, onClose, onWhatsappRedirect, transactionId }: ProofOfPaymentModalProps) {
  const { user } = useAuth() // Obter o usuário autenticado
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) {
      toast({ title: "Erro", description: "Usuário não autenticado ou nenhum arquivo selecionado.", variant: "destructive" })
      return
    }

    setIsUploading(true)
    try {
      // 2. Criar um caminho único para o comprovante
      const filePath = `receipts/${user.uid}/${transactionId}-${file.name}`
      const receiptUrl = await uploadFile(file, filePath)
      
      // 3. Atualizar a transação com a URL do comprovante
      await updateTransaction(transactionId, { metadata: { receiptUrl } })

      toast({
        title: "Comprovante Enviado!",
        description: "Seu comprovante foi anexado com sucesso e será analisado em breve.",
        variant: "success",
      })
      onClose();

    } catch (error) {
      console.error("Erro ao enviar comprovante:", error)
      toast({
        title: "Erro ao Enviar",
        description: "Não foi possível enviar o comprovante. Tente novamente ou use o WhatsApp.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleAttachReceiptClick = () => {
    fileInputRef.current?.click()
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
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden"
              accept="image/png, image/jpeg, image/gif, application/pdf"
            />
            
            <Button onClick={handleAttachReceiptClick} variant="outline" size="lg" className="h-14 text-lg" disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <Paperclip className="mr-2 h-6 w-6" />
              )}
              {isUploading ? "Enviando..." : "Anexar Comprovante"}
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
