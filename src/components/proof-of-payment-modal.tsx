
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
import { Paperclip, MessageCircle, Loader2 } from "lucide-react";
import { Settings } from "@/types";

interface ProofOfPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWhatsappRedirect: () => void; // This function will use settings from its parent scope
  onFileSelect: (file: File) => Promise<void>; 
  isUploading: boolean; 
  settings: Settings | null; // Added settings prop
}

export function ProofOfPaymentModal({
  isOpen,
  onClose,
  onWhatsappRedirect,
  onFileSelect,
  isUploading,
  settings, // Destructure settings from props
}: ProofOfPaymentModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await onFileSelect(file);
  };

  const handleAttachReceiptClick = () => {
    fileInputRef.current?.click();
  };

  // Disable WhatsApp button if settings or whatsappNumber is missing
  const isWhatsappDisabled = !settings || !settings.whatsappNumber;

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
            disabled={isWhatsappDisabled} // Disable button if no WhatsApp number
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
