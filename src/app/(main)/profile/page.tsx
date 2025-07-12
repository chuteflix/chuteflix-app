"use client";

import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFirstName(userData.firstName);
          setLastName(userData.lastName);
          setPhotoURL(userData.photoURL || "");
        }
      };
      fetchUserData();
    }
  }, [user]);

  const handleSave = async () => {
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          photoURL,
        });
        toast({
          title: "Perfil atualizado com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro ao atualizar o perfil.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-primary">Editar Perfil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Atualize seu nome e foto de perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={photoURL} />
                <AvatarFallback>{firstName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Input
                type="file"
                onChange={(e) => {
                  if (e.target.files) {
                    setPhotoURL(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">Nome</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Sobrenome</Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
