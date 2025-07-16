
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { uploadFile } from "@/services/storage";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Loader2, Upload, CheckCircle } from "lucide-react";

interface PaymentDetailsProps {
  settings: any;
  transactionId: string;
  onPaymentConfirmed: () => void;
}

export function PaymentDetails({ settings, transactionId, onPaymentConfirmed }: PaymentDetailsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleConfirmPayment = async () => {
    if (!user || !receiptFile) {
      toast({ title: "Anexe o comprovante para continuar.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const receiptUrl = await uploadFile(receiptFile, `receipts/deposits/${user.uid}/${Date.now()}_${receiptFile.name}`);
      const transactionRef = doc(db, "transactions", transactionId);
      await updateDoc(transactionRef, { metadata: { receiptUrl } });

      toast({
        title: "Comprovante Enviado!",
        description: "Sua solicitação será revisada em breve.",
        variant: "success",
      });
      onPaymentConfirmed();
    } catch (error) {
      toast({ title: "Erro ao enviar comprovante.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-green-500 flex items-center gap-2"><CheckCircle /> Solicitação Criada!</CardTitle>
          <CardDescription>
            Agora, realize o pagamento para concluir a recarga.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {settings.qrCodeUrl && (
              <Image src={settings.qrCodeUrl} alt="QR Code para pagamento" width={200} height={200} />
            )}
            <div className="text-center">
              <p className="font-semibold text-lg">Chave PIX (CNPJ)</p>
              <p className="text-muted-foreground">{settings.pixKey}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anexe o Comprovante</CardTitle>
          <CardDescription>
            Após o pagamento, anexe o comprovante para validarmos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="receipt">Comprovante de Pagamento</Label>
            <Input id="receipt" type="file" onChange={handleFileChange} />
          </div>
          <Button onClick={handleConfirmPayment} disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {isSubmitting ? "Enviando..." : "Confirmar Pagamento"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
