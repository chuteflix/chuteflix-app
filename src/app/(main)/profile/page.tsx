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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/lib/firebase";
import { Upload } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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
      const storage = getStorage();
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      
      setIsUploading(true);
      try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setPhotoURL(downloadURL);
        await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL });
        toast({ title: "Foto de perfil atualizada!" });
      } catch (error) {
        toast({ title: "Erro no upload da foto", variant: "destructive" });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
        });
        toast({
          title: "Perfil atualizado com sucesso!",
          style: { backgroundColor: '#39FF14', color: 'black', fontWeight: 'bold' }
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
      <h1 className="text-3xl font-bold mb-8 text-gray-50">Editar Perfil</h1>
      <Card className="max-w-3xl mx-auto bg-gray-950 border-gray-800 text-gray-50">
        <CardHeader>
          <CardTitle className="text-2xl">Informações Pessoais</CardTitle>
          <CardDescription className="text-gray-400">
            Atualize seu nome e foto de perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-gray-800">
                <AvatarImage src={photoURL} />
                <AvatarFallback>{firstName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-2">
                <Label htmlFor="picture" className="text-gray-300">Foto de Perfil</Label>
                 <Button asChild variant="outline" className="bg-gray-800 border-gray-700 hover:bg-gray-700">
                  <label htmlFor="picture">
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? 'Enviando...' : 'Trocar Foto'}
                    <Input id="picture" type="file" className="sr-only" onChange={handleFileChange} disabled={isUploading} />
                  </label>
                </Button>
                <p className="text-xs text-gray-500">PNG, JPG ou GIF de até 10MB.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name" className="text-gray-300">Nome</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-gray-900 border-gray-700 focus:ring-green-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name" className="text-gray-300">Sobrenome</Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-gray-900 border-gray-700 focus:ring-green-500"
                />
              </div>
            </div>

            <Button onClick={handleSave} className="w-full mt-4 bg-green-500 text-black font-bold hover:bg-green-600">
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
