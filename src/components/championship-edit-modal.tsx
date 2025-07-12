
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ChampionshipEditModalProps {
  championshipId: string
  currentName: string
  onChampionshipUpdated: (id: string, newName: string) => void
  children: React.ReactNode
}

export function ChampionshipEditModal({
  championshipId,
  currentName,
  onChampionshipUpdated,
  children,
}: ChampionshipEditModalProps) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState(currentName)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newName.trim()) {
      setError("O nome não pode estar vazio.")
      return
    }

    onChampionshipUpdated(championshipId, newName)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Campeonato</DialogTitle>
            <DialogDescription>
              Altere o nome do campeonato e clique em salvar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Novo Nome
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="col-span-3"
              />
            </div>
            {error && (
              <p className="col-span-4 text-red-500 text-sm text-center">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
