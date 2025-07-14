
"use client"

import { useState, useEffect } from "react"
import { Bolao } from "@/services/boloes"
import { getSettings, Settings } from "@/services/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Loader2 } from "lucide-react"

interface PaymentModalProps {
  onClose: () => void
  bolao: Bolao
  palpiteId: string
  teamAName: string
  teamBName: string
  championshipName: string
  scoreTeam1: number
  scoreTeam2: number
}

export function PaymentModal({ 
    onClose, 
    bolao, 
    palpiteId,
    teamAName,
    teamBName,
    championshipName,
    scoreTeam1,
    scoreTeam2
}: PaymentModalProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const settingsData = await getSettings()
        setSettings(settingsData)
      } catch (error) {
        toast({ title: "Erro ao carregar dados de pagamento.", variant: "destructive"})
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [toast])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setReceiptFile(event.target.files[0])
    }
  }

  const handleUploadReceipt = async () => {
    if (!receiptFile) {
      toast({ title: "Nenhum arquivo selecionado.", variant: "destructive" })
      return
    }
    // Lógica para fazer upload do comprovante
    toast({ title: "Comprovante enviado com sucesso!", variant: "success" })
    onClose()
  }

  const handleWhatsappRedirect = () => {
    if (!settings?.whatsappNumber) {
      toast({ title: "Número do WhatsApp não configurado.", variant: "destructive" })
      return
    }
    const message = `Acabei de apostar o placar ${scoreTeam1} ${teamAName} vs ${scoreTeam2} ${teamBName} no ${championshipName}.

Estou enviando o comprovante de pagamento do bolão.

Meu ID de palpite é: ${palpiteId}`
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${settings.whatsappNumber.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  
  if (!settings) {
    return (
      <div className="text-center h-40">
        <p>Não foi possível carregar as informações de pagamento. Tente novamente mais tarde.</p>
      </div>
    )
  }

  return (
    <>
        <div className="my-4 flex flex-col items-center gap-4">
            {settings.qrCodeUrl && (
              <Image 
                  src={settings.qrCodeUrl}
                  alt="QR Code para pagamento" 
                  width={150} 
                  height={150} 
              />
            )}
            <div className="text-center">
                <p className="font-semibold">Chave Pix (CNPJ):</p>
                <p className="text-muted-foreground">{settings.pixKey}</p>
            </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="receipt-upload">Anexar Comprovante</Label>
            <Input id="receipt-upload" type="file" onChange={handleFileChange} />
          </div>
          <Button onClick={handleUploadReceipt} className="w-full" disabled={!receiptFile}>
            Enviar Comprovante
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">Ou, se preferir</p>
          <Button onClick={handleWhatsappRedirect} variant="success" className="w-full">
            Enviar Comprovante pelo WhatsApp
          </Button>
        </div>
    </>
  )
}
