
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Category, addCategory, updateCategory } from "@/services/categories"
import { useCategories } from "@/hooks/use-categories"

const formSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  active: z.boolean().default(true),
  parentId: z.string().nullable().optional(),
})

type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormModalProps {
  children: React.ReactNode
  category?: Category
  onSave: () => void
}

export function CategoryFormModal({
  children,
  category,
  onSave,
}: CategoryFormModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const { categories } = useCategories(true) // Fetch all for parent selection

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      active: category?.active ?? true,
      parentId: category?.parentId || null,
    },
  })

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = form

  const handleOpenChange = (open: boolean) => {
    if (open) {
      reset({
        name: category?.name || "",
        description: category?.description || "",
        active: category?.active ?? true,
        parentId: category?.parentId || null,
      })
    }
    setIsOpen(open)
  }

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const payload = { ...data, parentId: data.parentId === 'null' ? null : data.parentId, order: category?.order ?? categories.length }
      if (category) {
        await updateCategory(category.id, payload)
        toast({
          title: "Sucesso!",
          description: "Categoria atualizada com sucesso.",
        })
      } else {
        await addCategory(payload)
        toast({
          title: "Sucesso!",
          description: "Nova categoria adicionada.",
        })
      }
      onSave()
      handleOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro. Por favor, tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Helper para achatar a hierarquia para o select
  const flattenCategories = (categories: Category[], level = 0): { label: string; value: string }[] => {
    let flatList: { label: string; value: string }[] = []
    for (const cat of categories) {
      flatList.push({ label: `${'—'.repeat(level)} ${cat.name}`, value: cat.id })
      if (cat.children && cat.children.length > 0) {
        flatList = flatList.concat(flattenCategories(cat.children, level + 1))
      }
    }
    return flatList
  }
  
  const availableParents = flattenCategories(categories.filter(c => c.id !== category?.id));


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Adicionar Nova Categoria"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Campeonatos Nacionais" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria Pai (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || "null"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria pai" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Nenhuma</SelectItem>
                      {availableParents.map(parent => (
                        <SelectItem key={parent.value} value={parent.value}>
                          {parent.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Uma breve descrição sobre a categoria."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Ativa</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Categorias inativas não são exibidas para os usuários.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

    