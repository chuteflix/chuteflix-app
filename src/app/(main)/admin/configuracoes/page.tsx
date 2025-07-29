
"use client"

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSettings, saveSettings } from "@/services/settings";
import { uploadFileToApi } from "@/services/upload";
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
import { Loader2, Upload } from "lucide-react";
import { IMaskInput } from "react-imask";
import { NumericFormat } from "react-number-format";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";

const settingsSchema = z.object({
  // Payment
  pixKey: z.string().min(1, "A chave PIX é obrigatória."),
  whatsappNumber: z.string().min(1, "O número de WhatsApp é obrigatório."),
  minDeposit: z.number().min(0, "O valor mínimo de depósito deve ser positivo."),
  minWithdrawal: z.number().min(0, "O valor mínimo de saque deve ser positivo."),
  // App
  appName: z.string().min(1, "O nome do aplicativo é obrigatório."),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);


  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      pixKey: "",
      whatsappNumber: "",
      minDeposit: 0,
      minWithdrawal: 0,
      appName: "ChuteFlix",
      metaDescription: "",
      metaKeywords: "",
    }
  });

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await getSettings();
        if (settings) {
          setValue("pixKey", settings.pixKey || "");
          setValue("whatsappNumber", settings.whatsappNumber || "");
          setValue("minDeposit", settings.minDeposit || 0);
          setValue("minWithdrawal", settings.minWithdrawal || 0);
          setValue("appName", settings.appName || "ChuteFlix");
          setValue("metaDescription", settings.metaDescription || "");
          setValue("metaKeywords", settings.metaKeywords || "");
          if (settings.qrCodeUrl) setQrCodePreview(settings.qrCodeUrl);
          if (settings.logoUrl) setLogoPreview(settings.logoUrl);
          if (settings.faviconUrl) setFaviconPreview(settings.faviconUrl);
        }
      } catch (error) {
        toast({ title: "Erro ao carregar configurações.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [setValue, toast]);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<File | null>>, previewSetter: React.Dispatch<React.SetStateAction<string | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: SettingsFormValues) => {
    setIsSaving(true);
    try {
      let finalQrCodeUrl = qrCodePreview;
      let finalLogoUrl = logoPreview;
      let finalFaviconUrl = faviconPreview;

      if (qrCodeFile) {
        finalQrCodeUrl = await uploadFileToApi(qrCodeFile);
      }
      if (logoFile) {
        finalLogoUrl = await uploadFileToApi(logoFile);
      }
      if (faviconFile) {
        finalFaviconUrl = await uploadFileToApi(faviconFile);
      }
      
      const settingsToSave: Settings = {
        ...data,
        qrCodeUrl: finalQrCodeUrl || '',
        logoUrl: finalLogoUrl || '',
        faviconUrl: finalFaviconUrl || '',
      };
      
      await saveSettings(settingsToSave);

      toast({ title: "Configurações salvas com sucesso!", description: "Pode ser necessário recarregar a página para ver todas as alterações.", variant: "success" });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({ title: "Erro ao salvar as configurações.", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Configurações Gerais
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
              <Label htmlFor="qrCode">QR Code de Pagamento</Label>
              <Input id="qrCode" type="file" accept="image/png, image/jpeg" onChange={handleFileChange(setQrCodeFile, setQrCodePreview)} />
              {qrCodePreview && (
                <div className="mt-4">
                  <Image src={qrCodePreview} alt="QR Code Preview" className="w-32 h-32" width={128} height={128} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Configurações do Aplicativo</CardTitle>
                <CardDescription>
                Personalize a identidade e as informações de SEO do seu site.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="appName">Nome do Aplicativo</Label>
                    <Controller
                        name="appName"
                        control={control}
                        render={({ field }) => <Input id="appName" {...field} />}
                    />
                    {errors.appName && <p className="text-red-500 text-sm">{errors.appName.message}</p>}
                </div>
                
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="logo">Logotipo</Label>
                        <Input id="logo" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleFileChange(setLogoFile, setLogoPreview)} />
                        {logoPreview && (
                            <div className="mt-4 bg-gray-800 p-4 rounded-md inline-block">
                                <Image src={logoPreview} alt="Logo Preview" className="h-16 w-auto" width={150} height={64} />
                            </div>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="favicon">Favicon</Label>
                        <Input id="favicon" type="file" accept="image/x-icon, image/png, image/svg+xml" onChange={handleFileChange(setFaviconFile, setFaviconPreview)} />
                        {faviconPreview && (
                            <div className="mt-4 bg-gray-800 p-2 rounded-md inline-block">
                                <Image src={faviconPreview} alt="Favicon Preview" className="h-8 w-8" width={32} height={32} />
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">Recomendado: .ico ou .png 32x32px.</p>
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="metaDescription">Meta Descrição (SEO)</Label>
                    <Controller
                        name="metaDescription"
                        control={control}
                        render={({ field }) => <Textarea id="metaDescription" placeholder="Descreva seu site para os mecanismos de busca." {...field} />}
                    />
                    {errors.metaDescription && <p className="text-red-500 text-sm">{errors.metaDescription.message}</p>}
                </div>
                
                <div className="grid gap-2">
                    <Label htmlFor="metaKeywords">Palavras-chave (SEO)</Label>
                     <Controller
                        name="metaKeywords"
                        control={control}
                        render={({ field }) => <Input id="metaKeywords" placeholder="Ex: bolão, futebol, apostas, prêmios" {...field} />}
                    />
                    <p className="text-xs text-muted-foreground">Separe as palavras-chave por vírgula.</p>
                    {errors.metaKeywords && <p className="text-red-500 text-sm">{errors.metaKeywords.message}</p>}
                </div>
            </CardContent>
        </Card>
        
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 rounded-lg shadow-md -mx-4 px-4">
            <Button type="submit" disabled={isSaving} size="lg">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Todas as Configurações
            </Button>
        </div>
      </form>
    </div>
  );
}
