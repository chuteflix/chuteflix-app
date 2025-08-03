
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
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadProfilePicture, updateUserProfile } from "@/services/users";
import { Upload, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFirstName(userData.firstName || "");
          setLastName(userData.lastName || "");
          setPhotoURL(userData.photoURL || "");
        }
      };
      fetchUserData();
    }
  }, [user]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && user) {
      const file = event.target.files[0];
      
      setIsUploading(true);
      try {
        const downloadURL = await uploadProfilePicture(user.uid, file);
        setPhotoURL(downloadURL);
        toast({ title: "Foto de perfil atualizada!", variant: "default" });
      } catch (error) {
        toast({ title: "Erro no upload da foto", description: "Verifique o tamanho e o formato do arquivo.", variant: "destructive" });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (user) {
      setIsSaving(true);
      try {
        await updateUserProfile(user.uid, {
          firstName,
          lastName,
        });
        toast({
          title: "Perfil atualizado com sucesso!",
          variant: "default"
        });
      } catch (error) {
        toast({
          title: "Erro ao atualizar o perfil.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Editar Perfil</h1>
      <Card className="max-w-3xl mx-auto bg-card border-border text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">Informações Pessoais</CardTitle>
          <CardDescription>
            Atualize seu nome e foto de perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-border">
                <AvatarImage src={photoURL} alt={`${firstName} ${lastName}`} />
                <AvatarFallback>{firstName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-2">
                <Label htmlFor="picture">Foto de Perfil</Label>
                 <Button asChild variant="outline" className="border-border hover:bg-muted">
                  <label htmlFor="picture" className="cursor-pointer">
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {isUploading ? 'Enviando...' : 'Trocar Foto'}
                    <Input id="picture" type="file" className="sr-only" onChange={handleFileChange} disabled={isUploading} accept="image/*" />
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground">PNG, JPG de até 5MB.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">Nome</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-background border-border focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Sobrenome</Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-background border-border focus:ring-primary"
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
