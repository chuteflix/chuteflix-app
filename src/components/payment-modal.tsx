
"use client"

import { useState, useEffect } from "react"
import { getSettings, Settings } from "@/services/settings"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Loader2, Copy, AlertTriangle, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void;
  onPaymentConfirmed: () => void;
  amount: number
}

export function PaymentModal({ isOpen, onClose, onPaymentConfirmed, amount }: PaymentModalProps) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      const fetchSettings = async () => {
        setIsLoading(true);
        try {
          const settingsData = await getSettings();
          setSettings(settingsData);
        } catch (error) {
          toast({ title: "Erro ao carregar dados de pagamento.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchSettings();
    }
  }, [isOpen, toast]);

  const handleCopy = () => {
    if (settings?.pixKey) {
      navigator.clipboard.writeText(settings.pixKey);
      toast({ title: "Chave Pix copiada!" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Realize o Pagamento</DialogTitle>
          <DialogDescription className="text-center">
            Para confirmar sua recarga, transfira exatamente o valor de <strong>{amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : !settings ? (
          <div className="text-center h-40"><p>Não foi possível carregar as informações de pagamento.</p></div>
        ) : (
          <div className="my-4 flex flex-col items-center gap-4">
            {settings.qrCodeUrl && <Image src={settings.qrCodeUrl} alt="QR Code para pagamento" width={180} height={180} />}
            <div className="text-center">
              <p className="font-semibold">Chave Pix (CNPJ):</p>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <code className="text-muted-foreground">{settings.pixKey}</code>
                <Button variant="ghost" size="icon" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
              </div>
            </div>
            
            <div className="w-full p-3 bg-blue-950/80 border border-blue-700 rounded-lg text-sm mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-5 w-5 text-blue-400" />
                <h4 className="font-semibold text-white">Como proceder</h4>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-blue-200">
                <li>Copie a chave PIX ou escaneie o QR Code.</li>
                <li>Faça a transferência no app do seu banco.</li>
                <li>Clique no botão abaixo para enviar o comprovante.</li>
              </ol>
            </div>
            
            <div className="w-full p-3 bg-amber-950/80 border border-amber-700 rounded-lg text-sm">
               <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <h4 className="font-semibold text-white">Aviso Importante</h4>
              </div>
              <p className="text-amber-200">
                  O saldo pode levar <strong>até 2 horas</strong> para ser creditado (das 06:00 às 23:00).
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onPaymentConfirmed} className="w-full h-12 text-lg">
            Já Paguei, Enviar Comprovante
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
