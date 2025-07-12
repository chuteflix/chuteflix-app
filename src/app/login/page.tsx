"use client";

import { useState, FormEvent } from "react";
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem('userFirstName', userData.firstName);
      }
      
      router.push('/dashboard'); 
    } catch (error: any) {
      toast({
        title: "Opa! Algo deu errado.",
        description: "Verifique seu e-mail e senha e tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
       <div className="mb-8">
        <Link href="/" aria-label="Voltar para a página inicial">
            <Logo />
        </Link>
      </div>
      <Card className="mx-auto w-full max-w-md bg-gray-950 border-gray-800 text-gray-50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Entrar</CardTitle>
          <CardDescription className="text-gray-400 pt-2">
            Bem-vindo(a) de volta! Faça login para continuar.
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
                className="bg-gray-900 border-gray-700 focus:ring-green-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="bg-gray-900 border-gray-700 focus:ring-green-500"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full mt-4 bg-green-500 text-black font-bold hover:bg-green-600"
              style={{'--neon-glow-color': '#39FF14'} as React.CSSProperties}
            >
              Entrar
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Não tem uma conta? </span>
            <Link href="/register" className="underline text-green-400 hover:text-green-300">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
