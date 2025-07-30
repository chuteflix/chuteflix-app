
"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getSettings, saveSettings, uploadQrCode } from "@/services/settings";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "@/types";
import Image from "next/image";

// Funções para aplicar máscaras (simplificadas para o front-end)
const applyCnpjMask = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, ""); // Remove tudo que não é dígito
  value = value.replace(/^(\d{2})(\d)/, "$1.$2");
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
  value = value.replace(/(\d{4})(\d)/, "$1-$2");
  return value.slice(0, 18); // Limita ao tamanho do CNPJ formatado
};

const applyPhoneMask = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  value = value.replace(/^(\d\d)(\d)/g, "($1) $2");
  value = value.replace(/(\d{5})(\d)/, "$1-$2");
  return value.slice(0, 15); // Limita ao tamanho do telefone formatado (XX) XXXXX-XXXX
};


const settingsSchema = z.object({
  appName: z.string().min(1, "Nome do aplicativo é obrigatório"),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(), // Adicionado faviconUrl
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  pixKey: z.string().optional(),
  qrCodeBase64: z.string().optional(),
  whatsappNumber: z.string().optional(),
  minDeposit: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "O depósito mínimo não pode ser negativo.").optional()
  ), // Adicionado minDeposit
  minWithdrawal: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0, "O saque mínimo não pode ser negativo.").optional()
  ), // Adicionado minWithdrawal
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null); // Novo estado para favicon
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewFavicon, setPreviewFavicon] = useState<string | null>(null); // Novo estado para preview favicon
  const [previewQr, setPreviewQr] = useState<string | null>(null);


  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      appName: "",
      logoUrl: "",
      faviconUrl: "", // Inicializar
      metaDescription: "",
      metaKeywords: "",
      pixKey: "",
      qrCodeBase64: "",
      whatsappNumber: "",
      minDeposit: 0, // Inicializar
      minWithdrawal: 0, // Inicializar
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const settingsData = await getSettings();
      if (settingsData) {
        form.reset(settingsData as SettingsFormValues);
        if(settingsData.logoUrl) setPreviewLogo(settingsData.logoUrl);
        if(settingsData.faviconUrl) setPreviewFavicon(settingsData.faviconUrl); // Carregar preview do favicon
        if(settingsData.qrCodeBase64) setPreviewQr(settingsData.qrCodeBase64);
      }
      setLoading(false);
    }
    fetchSettings();
  }, [form, toast]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        form.setValue('faviconUrl', base64String); // Set base64 directly to form
        setPreviewFavicon(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrCodeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        form.setValue('qrCodeBase64', base64String);
        setPreviewQr(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: SettingsFormValues) {
    setIsSaving(true);
    try {
      let finalLogoUrl = form.getValues("logoUrl");
      if (logoFile) {
        // Simulação do upload, em um caso real usaria um serviço de upload
        finalLogoUrl = "https://placehold.co/128x32/png"; // URL de placeholder
        console.log("Logo uploaded, URL:", finalLogoUrl);
      }
      
      let finalFaviconUrl = form.getValues("faviconUrl");
      if (faviconFile) {
        // Simulação do upload, em um caso real usaria um serviço de upload
        finalFaviconUrl = "https://placehold.co/32x32/png"; // URL de placeholder
        console.log("Favicon uploaded, URL:", finalFaviconUrl);
      }

      const dataToSave = { 
        ...values, 
        logoUrl: finalLogoUrl,
        faviconUrl: finalFaviconUrl,
        // Convert number inputs back to number if they came as string from form
        minDeposit: Number(values.minDeposit),
        minWithdrawal: Number(values.minWithdrawal),
      };
      await saveSettings(dataToSave);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do aplicativo foram atualizadas com sucesso.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">
              Configurações
          </h1>
          <p className="text-muted-foreground">
              Gerencie as informações e a identidade da sua plataforma.
          </p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Módulo 1: Informações de Pagamento */}
            <Card>
                <CardHeader>
                    <CardTitle>Informações de Pagamento</CardTitle>
                    <CardDescription>Gerencie os dados de pagamento que serão exibidos aos usuários.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="pixKey"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Chave PIX (CNPJ)</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="XX.XXX.XXX/XXXX-XX" 
                                    {...field} 
                                    value={applyCnpjMask(field.value || "")}
                                    onChange={(e) => field.onChange(applyCnpjMask(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="whatsappNumber"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Número de WhatsApp</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="(XX) XXXXX-XXXX" 
                                    {...field} 
                                    value={applyPhoneMask(field.value || "")}
                                    onChange={(e) => field.onChange(applyPhoneMask(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="minDeposit"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Depósito Mínimo (R$)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="10.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="minWithdrawal"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Saque Mínimo (R$)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="10.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <FormItem>
                        <FormLabel>QR Code de Pagamento</FormLabel>
                        <div className="flex items-center gap-4">
                            {previewQr && <Image src={previewQr} alt="Preview do QR Code" width={100} height={100} className="bg-muted p-1 rounded-md" />}
                            <FormControl>
                                <Input type="file" onChange={handleQrCodeFileChange} accept="image/*"/>
                            </FormControl>
                        </div>
                        <FormMessage>{form.formState.errors.qrCodeBase64?.message}</FormMessage>
                    </FormItem>
                     {/* Campo oculto para qrCodeBase64, pois é preenchido via onChange */}
                     <FormField
                        control={form.control}
                        name="qrCodeBase64"
                        render={({ field }) => (
                        <FormItem className="hidden">
                            <FormControl>
                               <Input type="text" {...field} />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Módulo 2: Configurações do Aplicativo */}
            <Card>
                <CardHeader>
                    <CardTitle>Configurações do Aplicativo</CardTitle>
                    <CardDescription>Personalize a identidade e as informações de SEO do seu site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="appName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome do Aplicativo</FormLabel>
                            <FormControl>
                            <Input placeholder="ChuteFlix" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem>
                            <FormLabel>Logotipo</FormLabel>
                            <div className="flex items-center gap-4">
                                {previewLogo && <Image src={previewLogo} alt="Preview do Logo" width={128} height={32} className="h-8 w-auto bg-muted p-1 rounded-md" />}
                                <FormControl>
                                    <Input type="file" onChange={handleLogoFileChange} accept="image/*" />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                        <FormItem>
                            <FormLabel>Favicon</FormLabel>
                            <div className="flex items-center gap-4">
                                {previewFavicon && <Image src={previewFavicon} alt="Preview do Favicon" width={32} height={32} className="h-8 w-auto bg-muted p-1 rounded-md" />}
                                <FormControl>
                                    <Input type="file" onChange={handleFaviconFileChange} accept=".ico,.png" />
                                </FormControl>
                            </div>
                            <p className="text-muted-foreground text-sm">Recomendado: .ico ou .png 32x32px</p>
                            <FormMessage />
                        </FormItem>
                    </div>
                     <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Meta Descrição (SEO)</FormLabel>
                            <FormControl>
                               <Textarea placeholder="Descreva seu site para os mecanismos de busca." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="metaKeywords"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Palavras-chave (SEO)</FormLabel>
                            <FormControl>
                               <Input placeholder="Ex: bolão, futebol, apostas, prêmios" {...field} />
                            </FormControl>
                            <FormMessage />
                            <p className="text-muted-foreground text-sm">Separe as palavras-chave por vírgula.</p>
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Spinner /> : "Salvar Alterações"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
