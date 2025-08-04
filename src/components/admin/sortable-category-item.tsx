
"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2 } from "lucide-react"

import { Category, deleteCategory } from "@/services/categories"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CategoryFormModal } from "@/components/category-form-modal"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface SortableCategoryItemProps {
  category: Category
  onUpdate: () => void
  level: number
}

export function SortableCategoryItem({
  category,
  onUpdate,
  level,
}: SortableCategoryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category.id })
  const { toast } = useToast()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${level * 1.5}rem`, // Adiciona o recuo
  }

  const handleDelete = async () => {
    try {
      await deleteCategory(category.id)
      toast({
        title: "Categoria excluída!",
        description: `A categoria "${category.name}" foi removida.`,
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description:
          "Não foi possível remover a categoria. Verifique se ela não possui bolões ou sub-categorias associados.",
        variant: "destructive",
      })
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center bg-background p-3 border rounded-lg shadow-sm"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab p-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
        aria-label="Reordenar categoria"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex-1 ml-4">
        <p className="font-semibold text-foreground">{category.name}</p>
        {category.description && (
          <p className="text-sm text-muted-foreground">
            {category.description}
          </p>
        )}
      </div>
      <Badge variant={category.active ? "default" : "secondary"}>
        {category.active ? "Ativa" : "Inativa"}
      </Badge>
      <div className="ml-4 flex items-center gap-2">
        <CategoryFormModal category={category} onSave={onUpdate}>
          <Button variant="ghost" size="icon" aria-label="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
        </CategoryFormModal>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Excluir">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita e irá excluir permanentemente a
                categoria <strong>{category.name}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
