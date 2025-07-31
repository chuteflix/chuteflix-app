
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { IMaskInput } from 'react-imask';
import { Logo } from "@/components/icons";
import { PasswordInput } from "@/components/ui/password-input";
import { getSettings } from "@/services/settings";
import { Settings } from "@/types";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }),
  lastName: z.string().min(2, { message: "Sobrenome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  phone: z.string().refine(value => /^\(\d{2}\) \d{5}-\d{4}$/.test(value), {
    message: "Número de telefone inválido.",
  }),
  cpf: z.string().refine(value => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value), {
    message: "CPF inválido.",
  }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar os Termos de Uso."
  }),
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar a Política de Privacidade."
  }),
});

export default function RegisterPage() {
  const [appSettings, setAppSettings] = useState<Settings | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      cpf: "",
      password: "",
      termsAccepted: false,
      privacyAccepted: false,
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (!loading && user) {
      router.replace('/inicio');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchAppSettings = async () => {
        const settings = await getSettings();
        setAppSettings(settings);
    }
    fetchAppSettings();
  }, []);

  const handleRegister = async (values: z.infer<typeof formSchema>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const fullName = `${values.firstName} ${values.lastName}`;
      await updateProfile(user, { displayName: fullName });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: values.firstName,
        lastName: values.lastName,
        name: fullName,
        phone: values.phone,
        cpf: values.cpf,
        email: user.email,
        balance: 0,
        createdAt: serverTimestamp(),
        role: 'user',
      });

      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer seus palpites.",
      });
    } catch (error: any) {
      toast({
        title: "Opa! Algo deu errado.",
        description: error.code === 'auth/email-already-in-use' ? "Este e-mail já está sendo utilizado." : "Não foi possível criar sua conta. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading || user) {
    return null; 
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-foreground">
      <div className="mb-8">
        <Link href="/" aria-label="Voltar para a página inicial">
            <Logo logoUrl={appSettings?.logoUrl} />
        </Link>
      </div>
      <Card className="mx-auto w-full max-w-lg bg-card border-border text-card-foreground">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Criar Conta</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            Junte-se à maior plataforma de bolões da América Latina.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)} className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Seu nome" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel>Sobrenome</FormLabel><FormControl><Input placeholder="Seu sobrenome" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" placeholder="seunome@email.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Telefone</FormLabel><FormControl>
                    <IMaskInput mask="(00) 00000-0000" value={field.value} onAccept={field.onChange} placeholder="(11) 99999-9999" className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background")} />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="cpf" render={({ field }) => (
                  <FormItem><FormLabel>CPF</FormLabel><FormControl>
                    <IMaskInput mask="000.000.000-00" value={field.value} onAccept={field.onChange} placeholder="000.000.000-00" className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background")} />
                  </FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Senha</FormLabel><FormControl><PasswordInput placeholder="Crie uma senha forte" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <div className="grid gap-3 pt-2">
                <FormField control={form.control} name="termsAccepted" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none"><FormLabel className="font-normal">Eu li e concordo com os <Link href="/terms" target="_blank" className="underline text-primary">Termos de Uso</Link>.</FormLabel><FormMessage /></div>
                  </FormItem>
                )} />
                <FormField control={form.control} name="privacyAccepted" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none"><FormLabel className="font-normal">Eu li e concordo com a <Link href="/privacy" target="_blank" className="underline text-primary">Política de Privacidade</Link>.</FormLabel><FormMessage /></div>
                  </FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? 'Finalizando Cadastro...' : 'Finalizar Cadastro'}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link href="/login" className="underline text-primary hover:text-primary/90">Entrar</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
