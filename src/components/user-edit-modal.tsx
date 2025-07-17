"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserProfile, updateUserProfile } from "@/services/users"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar" // 1. Importar Avatar
import { uploadProfilePicture } from "@/services/users" // 2. Importar função de upload

interface UserEditModalProps {
  user: UserProfile | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onUserUpdate: (updatedUser: UserProfile) => void
}

export function UserEditModal({
  user,
  isOpen,
  onOpenChange,
  onUserUpdate,
}: UserEditModalProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null) // 3. Estado para a imagem
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        cpf: user.cpf || "",
        phone: user.phone || "",
        photoURL: user.photoURL, // 4. Adicionar photoURL
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  // 5. Funções para lidar com a imagem
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoURL: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleSave = async () => {
    if (!user) return

    setIsUploading(true)
    try {
      let photoURL = user.photoURL // Manter a URL existente por padrão

      // Se uma nova imagem foi selecionada, faz o upload
      if (profileImageFile) {
        photoURL = await uploadProfilePicture(user.uid, profileImageFile)
      }

      const finalData = { ...formData, photoURL }
      await updateUserProfile(user.uid, finalData)
      const updatedUser = { ...user, ...finalData }
      onUserUpdate(updatedUser as UserProfile)

      toast({
        title: "Sucesso!",
        description: "Usuário atualizado com sucesso.",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Faça alterações no seu perfil aqui. Clique em salvar para aplicar
            as mudanças.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Avatar e Input de Arquivo */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
              <AvatarImage src={formData.photoURL} alt={user?.displayName} />
              <AvatarFallback>
                {user?.displayName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg"
            />
            <Button variant="outline" onClick={handleAvatarClick}>
              Alterar Foto
            </Button>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="displayName" className="text-right">
              Nome
            </Label>
            <Input
              id="displayName"
              value={formData.displayName || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cpf" className="text-right">
              CPF
            </Label>
            <Input
              id="cpf"
              value={formData.cpf || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Telefone
            </Label>
            <Input
              id="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={isUploading}>
            {isUploading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
