
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { getSettings, saveSettings } from "@/services/settings";
import { uploadFileToApi } from "@/services/upload";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Settings } from "@/types";
import Image from "next/image";
import { ColorInput } from "@/components/admin/color-input";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida. Use o formato #RRGGBB.");

const settingsSchema = z.object({
  appName: z.string().min(1, "Nome do aplicativo é obrigatório"),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  pixKey: z.string().optional(),
  qrCodeUrl: z.string().optional(), // Alterado de qrCodeBase64 para qrCodeUrl
  whatsappNumber: z.string().optional(),
  minDeposit: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  minWithdrawal: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  colors: z.object({
    primary: hexColor.optional().nullable(),
    secondary: hexColor.optional().nullable(),
    accent: hexColor.optional().nullable(),
    background: hexColor.optional().nullable(),
    text: hexColor.optional().nullable(),
  }).optional().nullable(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const defaultColors = {
  primary: "#39D353",
  secondary: "#3F444E",
  accent: "#39D353",
  background: "#121212",
  text: "#FFFFFF",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewFavicon, setPreviewFavicon] = useState<string | null>(null);
  const [previewQr, setPreviewQr] = useState<string | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      appName: "",
      logoUrl: "",
      faviconUrl: "",
      metaDescription: "",
      metaKeywords: "",
      pixKey: "",
      qrCodeUrl: "",
      whatsappNumber: "",
      minDeposit: 0,
      minWithdrawal: 0,
      colors: defaultColors,
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const settingsData = await getSettings();
      if (settingsData) {
        form.reset({
          ...settingsData,
          colors: settingsData.colors ? { ...defaultColors, ...settingsData.colors } : defaultColors,
        });
        if (settingsData.logoUrl) setPreviewLogo(settingsData.logoUrl);
        if (settingsData.faviconUrl) setPreviewFavicon(settingsData.faviconUrl);
        if (settingsData.qrCodeUrl) setPreviewQr(settingsData.qrCodeUrl);
      }
      setLoading(false);
    }
    fetchSettings();
  }, [form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: SettingsFormValues) {
    setIsSaving(true);
    try {
      let finalLogoUrl = values.logoUrl;
      if (logoFile) {
        finalLogoUrl = await uploadFileToApi(logoFile);
      }
      
      let finalFaviconUrl = values.faviconUrl;
      if (faviconFile) {
        finalFaviconUrl = await uploadFileToApi(faviconFile);
      }
      
      let finalQrCodeUrl = values.qrCodeUrl;
      if (qrCodeFile) {
        finalQrCodeUrl = await uploadFileToApi(qrCodeFile);
      }

      const dataToSave: Partial<Settings> = {
        ...values,
        logoUrl: finalLogoUrl,
        faviconUrl: finalFaviconUrl,
        qrCodeUrl: finalQrCodeUrl,
        minDeposit: Number(values.minDeposit) || 0,
        minWithdrawal: Number(values.minWithdrawal) || 0,
      };

      await saveSettings(dataToSave);
      
      toast({
        title: "Configurações Salvas",
        description: "Suas alterações foram salvas com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao Salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-2">Configurações</h1>
      <p className="text-muted-foreground mb-8">Gerencie as informações e a identidade da sua plataforma.</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle>Identidade Visual e SEO</CardTitle>
              <CardDescription>Personalize a identidade e as informações de SEO do seu site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="appName" render={({ field }) => (
                <FormItem><FormLabel>Nome do Aplicativo</FormLabel><FormControl><Input placeholder="ChuteFlix" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Logotipo</FormLabel>
                  {previewLogo && <Image src={previewLogo} alt="Preview do Logo" width={128} height={32} className="h-8 w-auto bg-muted p-1 rounded-md" />}
                  <FormControl><Input type="file" onChange={(e) => handleFileChange(e, setLogoFile, setPreviewLogo)} accept="image/*" /></FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel>Favicon</FormLabel>
                  {previewFavicon && <Image src={previewFavicon} alt="Preview do Favicon" width={32} height={32} className="h-8 w-auto bg-muted p-1 rounded-md" />}
                  <FormControl><Input type="file" onChange={(e) => handleFileChange(e, setFaviconFile, setPreviewFavicon)} accept=".ico,.png" /></FormControl>
                </FormItem>
              </div>
              <FormField control={form.control} name="metaDescription" render={({ field }) => (
                <FormItem><FormLabel>Meta Descrição (SEO)</FormLabel><FormControl><Textarea placeholder="Descreva seu site..." {...field} /></FormControl></FormItem>
              )}/>
              <FormField control={form.control} name="metaKeywords" render={({ field }) => (
                <FormItem><FormLabel>Palavras-chave (SEO)</FormLabel><FormControl><Input placeholder="bolão, futebol, prêmios" {...field} /></FormControl></FormItem>
              )}/>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Pagamento</CardTitle>
              <CardDescription>Gerencie as informações para depósitos e saques na plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="pixKey" render={({ field }) => (
                <FormItem><FormLabel>Chave PIX Principal</FormLabel><FormControl><Input placeholder="email@dominio.com" {...field} /></FormControl></FormItem>
              )}/>
               <FormItem>
                  <FormLabel>QR Code PIX</FormLabel>
                  {previewQr && <Image src={previewQr} alt="Preview do QR Code" width={128} height={128} className="bg-muted p-1 rounded-md" />}
                  <FormControl><Input type="file" onChange={(e) => handleFileChange(e, setQrCodeFile, setPreviewQr)} accept="image/*" /></FormControl>
                </FormItem>
              <FormField control={form.control} name="whatsappNumber" render={({ field }) => (
                <FormItem><FormLabel>Número do WhatsApp (Suporte)</FormLabel><FormControl><Input placeholder="(99) 99999-9999" {...field} /></FormControl></FormItem>
              )}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="minDeposit" render={({ field }) => (
                  <FormItem><FormLabel>Depósito Mínimo (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="minWithdrawal" render={({ field }) => (
                  <FormItem><FormLabel>Saque Mínimo (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? <Spinner /> : "Salvar Todas as Configurações"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
