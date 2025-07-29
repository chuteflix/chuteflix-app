
"use client";

import { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [appSettings, setAppSettings] = useState<Settings | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Se o usuário já estiver logado, redireciona para a página de início
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

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const fullName = `${firstName} ${lastName}`;

      await updateProfile(user, {
        displayName: fullName
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        name: fullName,
        phone,
        cpf,
        email: user.email,
        balance: 0,
        createdAt: serverTimestamp(),
        role: 'user', // Define a role padrão
      });

      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer seus palpites.",
      });
      // O redirecionamento agora é tratado pelo useEffect acima
    } catch (error: any) {
      toast({
        title: "Opa! Algo deu errado.",
        description: "Não foi possível criar sua conta. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const inputClasses = "bg-background border-border focus:ring-primary flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  // Enquanto verifica o status do usuário, não mostra nada para evitar um "flash" da tela de registro
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
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">Nome</Label>
                <Input id="first-name" placeholder="Seu nome" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClasses} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Sobrenome</Label>
                <Input id="last-name" placeholder="Seu sobrenome" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClasses} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seunome@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <IMaskInput
                    mask="(00) 00000-0000"
                    value={phone}
                    onAccept={(value) => setPhone(value as string)}
                    placeholder="(11) 99999-9999"
                    className={inputClasses}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <IMaskInput
                    mask="000.000.000-00"
                    value={cpf}
                    onAccept={(value) => setCpf(value as string)}
                    placeholder="000.000.000-00"
                    className={inputClasses}
                  />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput 
                id="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha forte"
                className={inputClasses}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full mt-4 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
            >
              Finalizar Cadastro
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
             <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link href="/login" className="underline text-primary hover:text-primary/90">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
