
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
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/icons";
import { PasswordInput } from "@/components/ui/password-input";
import { getSettings } from "@/services/settings";
import { Settings } from "@/types";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
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

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // O redirecionamento agora é tratado pelo useEffect acima
    } catch (error: any) {
      toast({
        title: "Opa! Algo deu errado.",
        description: "Verifique seu e-mail e senha e tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Enquanto verifica o status do usuário, não mostra nada para evitar um "flash" da tela de login
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
      <Card className="mx-auto w-full max-w-md bg-card border-border text-card-foreground">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{appSettings?.appName || "Bem-vindo"}</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            Faça login para continuar na maior plataforma de bolões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seunome@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border focus:ring-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="bg-background border-border focus:ring-primary"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full mt-4 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
            >
              Entrar
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link href="/register" className="underline text-primary hover:text-primary/90">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
