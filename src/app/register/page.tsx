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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { IMaskInput } from 'react-imask';
import { Logo } from "@/components/icons";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        phone,
        cpf,
        email: user.email,
      });

      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer seus palpites.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: "Opa! Algo deu errado.",
        description: "Não foi possível criar sua conta. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const inputClasses = "bg-gray-900 border-gray-700 focus:ring-green-500 flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="mb-8">
        <Link href="/" aria-label="Voltar para a página inicial">
            <Logo />
        </Link>
      </div>
      <Card className="mx-auto w-full max-w-lg bg-gray-950 border-gray-800 text-gray-50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Criar Conta</CardTitle>
          <CardDescription className="text-gray-400 pt-2">
            Junte-se à maior plataforma de bolões da América Latina.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">Nome</Label>
                <Input id="first-name" placeholder="Seu nome" required value={firstName} onChange={(e) => setFirstName(e.start.value)} className={inputClasses} />
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
                    onAccept={(value) => setPhone(value)}
                    placeholder="(11) 99999-9999"
                    className={inputClasses}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <IMaskInput
                    mask="000.000.000-00"
                    value={cpf}
                    onAccept={(value) => setCpf(value)}
                    placeholder="000.000.000-00"
                    className={inputClasses}
                  />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha forte"
                className={inputClasses}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full mt-4 bg-green-500 text-black font-bold hover:bg-green-600"
              style={{'--neon-glow-color': '#39FF14'} as React.CSSProperties}
            >
              Finalizar Cadastro
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
             <span className="text-gray-400">Já tem uma conta? </span>
            <Link href="/login" className="underline text-green-400 hover:text-green-300">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
