
"use client"

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSettings, saveSettings, uploadQrCode } from "@/services/settings";
import { Settings } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { IMaskInput } from "react-imask";
import { NumericFormat } from "react-number-format";

const settingsSchema = z.object({
  pixKey: z.string().min(1, "A chave PIX é obrigatória."),
  whatsappNumber: z.string().min(1, "O número de WhatsApp é obrigatório."),
  minDeposit: z.number().min(0, "O valor mínimo de depósito deve ser positivo."),
  minWithdrawal: z.number().min(0, "O valor mínimo de saque deve ser positivo."),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      pixKey: "",
      whatsappNumber: "",
      minDeposit: 0,
      minWithdrawal: 0,
    }
  });

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await getSettings();
        if (settings) {
          setValue("pixKey", settings.pixKey);
          setValue("whatsappNumber", settings.whatsappNumber);
          setValue("minDeposit", settings.minDeposit || 0);
          setValue("minWithdrawal", settings.minWithdrawal || 0);
          if (settings.qrCodeUrl) {
            setQrCodePreview(settings.qrCodeUrl);
          }
        }
      } catch (error) {
        toast({ title: "Erro ao carregar configurações.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [setValue, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQrCodeFile(file);
      setQrCodePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: SettingsFormValues) => {
    setIsLoading(true);
    try {
      if (qrCodeFile) {
        const qrCodeUrl = await uploadQrCode(qrCodeFile);
        await saveSettings({ ...data, qrCodeUrl });
      } else {
        await saveSettings(data);
      }

      toast({ title: "Configurações salvas com sucesso!", variant: "success" });
    } catch (error) {
      toast({ title: "Erro ao salvar as configurações.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Configurações de Pagamento
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informações de Pagamento</CardTitle>
            <CardDescription>
              Gerencie os dados de pagamento que serão exibidos aos usuários.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
             <div className="grid gap-2">
                <Label htmlFor="pixKey">Chave PIX (CNPJ)</Label>
                <Controller
                    name="pixKey"
                    control={control}
                    render={({ field }) => <Input id="pixKey" {...field} />}
                />
                {errors.pixKey && <p className="text-red-500 text-sm">{errors.pixKey.message}</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="whatsappNumber">Número de WhatsApp</Label>
                <Controller
                    name="whatsappNumber"
                    control={control}
                    render={({ field }) => (
                        <IMaskInput
                            mask="(00) 00000-0000"
                            value={field.value}
                            onAccept={(value: any) => field.onChange(value)}
                            placeholder="(99) 99999-9999"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    )}
                />
                {errors.whatsappNumber && <p className="text-red-500 text-sm">{errors.whatsappNumber.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minDeposit">Depósito Mínimo (R$)</Label>
                <Controller
                  name="minDeposit"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={Input}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                      value={field.value}
                      onValueChange={(values) => field.onChange(values.floatValue)}
                    />
                  )}
                />
                {errors.minDeposit && <p className="text-red-500 text-sm">{errors.minDeposit.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minWithdrawal">Saque Mínimo (R$)</Label>
                <Controller
                  name="minWithdrawal"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={Input}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="R$ "
                      value={field.value}
                      onValueChange={(values) => field.onChange(values.floatValue)}
                    />
                  )}
                />
                {errors.minWithdrawal && <p className="text-red-500 text-sm">{errors.minWithdrawal.message}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="qrCode">QR Code</Label>
              <Input id="qrCode" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
              {qrCodePreview && (
                <div className="mt-4">
                  <img src={qrCodePreview} alt="QR Code Preview" className="w-32 h-32" />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
