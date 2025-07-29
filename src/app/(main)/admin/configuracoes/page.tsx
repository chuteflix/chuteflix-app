
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

const settingsSchema = z.object({
  appName: z.string().min(1, "Nome do aplicativo é obrigatório"),
  logoUrl: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  pixKey: z.string().optional(),
  qrCodeBase64: z.string().optional(), // Mantido como base64
  whatsappNumber: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewQr, setPreviewQr] = useState<string | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      appName: "",
      logoUrl: "",
      metaDescription: "",
      metaKeywords: "",
      pixKey: "",
      qrCodeBase64: "",
      whatsappNumber: "",
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      const settingsData = await getSettings();
      if (settingsData) {
        form.reset(settingsData as SettingsFormValues);
        if(settingsData.logoUrl) setPreviewLogo(settingsData.logoUrl);
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
      
      const dataToSave = { ...values, logoUrl: finalLogoUrl };
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
              Configurações Gerais
          </h1>
          <p className="text-muted-foreground">
              Gerencie as informações e a identidade da sua plataforma.
          </p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Configurações do Aplicativo</CardTitle>
                    <CardDescription>Personalize o nome, logo e SEO do seu site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="appName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome do Aplicativo</FormLabel>
                            <FormControl>
                            <Input placeholder="Nome do aplicativo" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
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
                     <FormField
                        control={form.control}
                        name="metaDescription"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Meta Descrição (SEO)</FormLabel>
                            <FormControl>
                               <Textarea placeholder="Descreva seu site para os motores de busca." {...field} />
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
                               <Input placeholder="bolão, futebol, apostas, ..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Configurações de Pagamento</CardTitle>
                    <CardDescription>Configure os métodos para depósitos e saques na plataforma.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="pixKey"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Chave Pix</FormLabel>
                            <FormControl>
                                <Input placeholder="Sua chave pix" {...field} />
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
                            <FormLabel>Número do WhatsApp para Suporte</FormLabel>
                            <FormControl>
                                <Input placeholder="+5511999999999" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormItem>
                        <FormLabel>QR Code PIX (gerado pelo seu banco)</FormLabel>
                        <div className="flex items-center gap-4">
                            {previewQr && <Image src={previewQr} alt="Preview do QR Code" width={100} height={100} />}
                            <FormControl>
                                <Input type="file" onChange={handleQrCodeFileChange} accept="image/*"/>
                            </FormControl>
                        </div>
                        <FormMessage>{form.formState.errors.qrCodeBase64?.message}</FormMessage>
                    </FormItem>
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

          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Spinner /> : "Salvar Configurações"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
