
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
import { Paperclip, Loader2 } from "lucide-react";
import { uploadFile } from "@/services/storage";
import { updateTransaction } from "@/services/transactions";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

interface WithdrawalProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  userId: string;
}

export function WithdrawalProofModal({
  isOpen,
  onClose,
  transactionId,
  userId,
}: WithdrawalProofModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
    }
  };

  const handleAttachReceiptClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleConfirm = async () => {
    if (!file) {
        toast({ title: "Nenhum arquivo selecionado.", description: "Por favor, anexe o comprovante.", variant: "destructive"});
        return;
    }

    setIsUploading(true);
    try {
        const filePath = `receipts/withdrawals/${userId}/${transactionId}-${file.name}`;
        const receiptUrl = await uploadFile(file, filePath);
        
        await updateTransaction(transactionId, { metadata: { receiptUrl } });
        
        const confirmWithdrawal = httpsCallable(functions, 'confirmWithdrawal');
        await confirmWithdrawal({ transactionId });

        toast({ title: "Saque confirmado e comprovante enviado!", variant: "success" });
        onClose();

    } catch (error: any) {
        toast({ title: "Erro ao confirmar saque.", description: error.message, variant: "destructive" });
    } finally {
        setIsUploading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Anexar Comprovante de Saque
          </DialogTitle>
          <DialogDescription className="text-center">
            Faça o upload do comprovante de pagamento para finalizar a solicitação de saque.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 flex flex-col items-center gap-4">
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
            className="w-full h-14 text-lg"
            disabled={isUploading}
          >
            <Paperclip className="mr-2 h-6 w-6" />
            {file ? file.name : "Selecionar Arquivo"}
          </Button>
          <p className="text-xs text-muted-foreground">
            {file ? "Arquivo selecionado. Clique em 'Confirmar' para finalizar." : "Selecione o comprovante de pagamento."}
          </p>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="ghost">Cancelar</Button>
          <Button onClick={handleConfirm} disabled={isUploading || !file}>
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isUploading ? "Enviando..." : "Confirmar e Enviar Comprovante"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
