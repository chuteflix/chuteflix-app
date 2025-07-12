
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
import { addBolao, Bolao } from "@/services/boloes"

interface BolaoFormModalProps {
  onBolaoAdded: (newBolao: Bolao) => void
  children: React.ReactNode
}

export function BolaoFormModal({
  onBolaoAdded,
  children,
}: BolaoFormModalProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    prize: "",
    fee: "",
    endDate: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { name, prize, fee, endDate } = formData
    if (!name || !prize || !fee || !endDate) {
      setError("Todos os campos são obrigatórios.")
      return
    }

    try {
      const newBolao = await addBolao({
        name,
        prize: parseFloat(prize),
        fee: parseFloat(fee),
        endDate,
      })
      onBolaoAdded(newBolao) // Atualiza a lista na página principal
      setFormData({ name: "", prize: "", fee: "", endDate: "" }) // Limpa o formulário
      setOpen(false) // Fecha o modal
    } catch (err) {
      setError("Falha ao criar o bolão. Tente novamente.")
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Bolão</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para criar um novo bolão.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prize" className="text-right">Prêmio (R$)</Label>
              <Input id="prize" type="number" value={formData.prize} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fee" className="text-right">Taxa (R$)</Label>
              <Input id="fee" type="number" value={formData.fee} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">Encerramento</Label>
              <Input id="endDate" type="date" value={formData.endDate} onChange={handleChange} className="col-span-3" />
            </div>
            {error && <p className="col-span-4 text-red-500 text-sm text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Salvar Bolão</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
