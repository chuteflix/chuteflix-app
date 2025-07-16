"use client"

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, MessageCircle, Loader2 } from "lucide-react";

interface ProofOfPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWhatsappRedirect: () => void;
  onFileSelect: (file: File) => Promise<void>; // 1. Nova prop para lidar com a seleção do arquivo
  isUploading: boolean; // 2. Receber o estado de upload
}

export function ProofOfPaymentModal({
  isOpen,
  onClose,
  onWhatsappRedirect,
  onFileSelect,
  isUploading,
}: ProofOfPaymentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // 3. Chama a função passada por prop para fazer o upload
    try {
      await onFileSelect(file);
      toast({
        title: "Comprovante Enviado!",
        description: "Seu comprovante foi anexado e será analisado em breve.",
        variant: "success",
      })
      onClose();
    } catch (error) {
        // A página que chama o modal será responsável por lidar com o erro
    }
  };

  const handleAttachReceiptClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Enviar Comprovante
          </DialogTitle>
          <DialogDescription className="text-center">
            Para acelerar a aprovação da sua recarga, por favor, envie o
            comprovante de pagamento.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 flex flex-col gap-4">
          <Button
            onClick={onWhatsappRedirect}
            variant="success"
            size="lg"
            className="h-14 text-lg"
          >
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

          <Button
            onClick={handleAttachReceiptClick}
            variant="outline"
            size="lg"
            className="h-14 text-lg"
            disabled={isUploading}
          >
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
  );
}
