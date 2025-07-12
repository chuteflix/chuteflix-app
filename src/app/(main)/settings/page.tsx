"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pixKeyType, setPixKeyType] = useState("cpf");
  const [randomPixKey, setRandomPixKey] = useState("");
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setPixKeyType(data.pixKeyType || 'cpf');
          if (data.pixKeyType === 'random') {
            setRandomPixKey(data.pixKey || '');
          }
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    if (user) {
      let pixKey = "";
      switch (pixKeyType) {
        case "cpf":
          pixKey = userData?.cpf;
          break;
        case "email":
          pixKey = userData?.email;
          break;
        case "phone":
          pixKey = userData?.phone;
          break;
        case "random":
          pixKey = randomPixKey;
          break;
      }

      try {
        await setDoc(doc(db, "users", user.uid), { 
          pixKeyType,
          pixKey
        }, { merge: true });

        toast({
          title: "Chave PIX salva com sucesso!",
          description: `Sua chave PIX (${pixKeyType}) foi atualizada.`,
          style: { backgroundColor: '#39FF14', color: 'black', fontWeight: 'bold' }
        });
      } catch (error) {
         toast({
          title: "Opa! Algo deu errado.",
          description: "Não foi possível salvar sua chave PIX.",
          variant: "destructive",
      });
      }
    }
  };

  const radioItemClasses = "flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-900 p-4 hover:bg-gray-800 hover:text-gray-200 peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500 text-gray-400";

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-50">Configurações</h1>
      <Card className="max-w-3xl mx-auto bg-gray-950 border-gray-800 text-gray-50">
        <CardHeader>
          <CardTitle className="text-2xl">Chave PIX</CardTitle>
          <CardDescription className="text-gray-400">
            Selecione ou cadastre a chave PIX que você usará para receber seus prêmios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <RadioGroup
              value={pixKeyType}
              onValueChange={setPixKeyType}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="cpf" id="cpf" className="peer sr-only" />
                <Label htmlFor="cpf" className={radioItemClasses}>
                  CPF
                  <span className="text-sm font-semibold text-gray-200 mt-2">
                    {userData?.cpf || 'Carregando...'}
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="email" id="email" className="peer sr-only" />
                <Label htmlFor="email" className={radioItemClasses}>
                  E-mail
                  <span className="text-sm font-semibold text-gray-200 mt-2">
                     {userData?.email || 'Carregando...'}
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="phone" id="phone" className="peer sr-only" />
                <Label htmlFor="phone" className={radioItemClasses}>
                  Telefone
                  <span className="text-sm font-semibold text-gray-200 mt-2">
                     {userData?.phone || 'Carregando...'}
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="random" id="random" className="peer sr-only" />
                <Label htmlFor="random" className={radioItemClasses}>
                  Chave Aleatória
                </Label>
              </div>
            </RadioGroup>
            {pixKeyType === "random" && (
              <div className="grid gap-2">
                <Label htmlFor="random-key" className="text-gray-300">Sua Chave Aleatória</Label>
                <Input
                  id="random-key"
                  placeholder="Cole sua chave aleatória aqui"
                  value={randomPixKey}
                  onChange={(e) => setRandomPixKey(e.target.value)}
                  className="bg-gray-900 border-gray-700 focus:ring-green-500"
                />
              </div>
            )}
            <Button onClick={handleSave} className="w-full mt-4 bg-green-500 text-black font-bold hover:bg-green-600">
              Salvar Chave PIX
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
