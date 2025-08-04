
"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import {
  Category,
  getAllCategories,
  updateCategoryOrder,
} from "@/services/categories"
import { Button } from "@/components/ui/button"
import { CategoryFormModal } from "@/components/category-form-modal"
import { useToast } from "@/hooks/use-toast"
import { SortableCategoryItem } from "@/components/admin/sortable-category-item"

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const fetchedCategories = await getAllCategories(true)
      setCategories(fetchedCategories)
    } catch (error) {
      toast({
        title: "Erro ao buscar categorias",
        description:
          "Não foi possível carregar a lista de categorias. Tente novamente.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const flattenCategoriesForDnd = (categories: Category[]): Category[] => {
    const flatList: Category[] = []
    const traverse = (cats: Category[]) => {
      for (const cat of cats) {
        flatList.push(cat)
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children)
        }
      }
    }
    traverse(categories)
    return flatList
  }
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
        const flatCategories = flattenCategoriesForDnd(categories);
        const oldIndex = flatCategories.findIndex(c => c.id === active.id);
        const newIndex = flatCategories.findIndex(c => c.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        // Perform the move in the flattened list to determine the new order
        const newOrderedFlatList = arrayMove(flatCategories, oldIndex, newIndex);

        try {
            // Update the order of all categories based on the new flat list order
            await updateCategoryOrder(newOrderedFlatList.map(c => c.id));
            toast({
                title: "Ordem atualizada!",
                description: "A nova ordem das categorias foi salva.",
            });
            fetchCategories(); // Re-fetch to get the updated tree structure
        } catch (error) {
            toast({
                title: "Erro ao reordenar",
                description: "Não foi possível salvar a nova ordem.",
                variant: "destructive",
            });
        }
    }
};


  const renderCategory = (category: Category, level = 0) => (
    <div key={category.id}>
      <SortableCategoryItem
        category={category}
        onUpdate={fetchCategories}
        level={level}
      />
      {category.children && category.children.length > 0 && (
        <div className="pl-6 border-l-2 border-dashed border-muted ml-4">
          <SortableContext items={category.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {category.children.map(child => renderCategory(child, level + 1))}
          </SortableContext>
        </div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Gerenciamento de Categorias
          </h1>
          <p className="text-muted-foreground">
            Crie e organize a hierarquia do seu catálogo de bolões.
          </p>
        </div>
        <CategoryFormModal onSave={fetchCategories}>
          <Button>Adicionar Nova Categoria</Button>
        </CategoryFormModal>
      </div>

      <div className="bg-card border rounded-lg p-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Carregando categorias...</p>
        ) : categories.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={flattenCategoriesForDnd(categories).map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {categories.map(category => renderCategory(category))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-16 px-4 border-2 border-dashed border-muted rounded-lg">
            <h3 className="text-xl font-semibold">Nenhuma categoria encontrada</h3>
            <p className="text-muted-foreground mt-2">Comece adicionando uma!</p>
          </div>
        )}
      </div>
    </div>
  )
}
