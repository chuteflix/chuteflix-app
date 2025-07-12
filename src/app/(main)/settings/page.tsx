"use client";

import { useState } from "react";
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

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pixKeyType, setPixKeyType] = useState("cpf");
  const [randomPixKey, setRandomPixKey] = useState("");

  const handleSave = () => {
    // Lógica para salvar a chave PIX
    toast({
      title: "Chave PIX salva com sucesso!",
    });
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-primary">Configurações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Chave PIX</CardTitle>
          <CardDescription>
            Selecione ou cadastre uma chave PIX para receber seus prêmios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <RadioGroup
              value={pixKeyType}
              onValueChange={setPixKeyType}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="cpf" id="cpf" className="peer sr-only" />
                <Label
                  htmlFor="cpf"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  CPF
                  <span className="text-sm text-muted-foreground">
                    {user?.cpf}
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="email"
                  id="email"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="email"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  E-mail
                  <span className="text-sm text-muted-foreground">
                    {user?.email}
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="phone"
                  id="phone"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="phone"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Telefone
                  <span className="text-sm text-muted-foreground">
                    {user?.phone}
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="random"
                  id="random"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="random"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Chave Aleatória
                </Label>
              </div>
            </RadioGroup>
            {pixKeyType === "random" && (
              <div className="grid gap-2">
                <Label htmlFor="random-key">Chave Aleatória</Label>
                <Input
                  id="random-key"
                  placeholder="Cole sua chave aleatória aqui"
                  value={randomPixKey}
                  onChange={(e) => setRandomPixKey(e.target.value)}
                />
              </div>
            )}
            <Button onClick={handleSave} className="w-full">
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
