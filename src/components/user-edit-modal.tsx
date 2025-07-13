
"use client"

import { useState, useEffect } from "react"
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
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        cpf: user.cpf || "",
        phone: user.phone || "",
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    if (!user) return

    try {
      await updateUserProfile(user.uid, formData)
      const updatedUser = { ...user, ...formData }
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
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Faça alterações no perfil do usuário aqui. Clique em salvar para
            aplicar as mudanças.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <Button type="submit" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
