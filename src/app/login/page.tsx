"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      router.push("/inicio");
    }
  }, [user, loading, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O redirecionamento é tratado pelo useEffect
    } catch (error: any) {
      toast({
        title: "Opa! Algo deu errado.",
        description: "Verifique seu e-mail e senha e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "E-mail necessário",
        description: "Por favor, insira seu e-mail para redefinir a senha.",
        variant: "warning",
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "E-mail de redefinição enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar e-mail",
        description: "Não foi possível enviar o e-mail de redefinição. Verifique o e-mail digitado.",
        variant: "destructive",
      });
    }
  };

  if (loading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Entre com seu e-mail e senha para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Button variant="link" type="button" onClick={handlePasswordReset} className="px-0 text-xs h-auto">
                  Esqueceu a senha?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                    Cadastre-se
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
