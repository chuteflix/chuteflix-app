"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Category,
  getAllCategories,
  deleteCategory,
  updateCategoryOrder,
} from "@/services/categories";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  PlusCircle,
  Trash,
  Pencil,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoryFormModal } from "@/components/category-form-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper function to move an element in an array
function arrayMove<T>(array: T[], from: number, to: number): T[] {
    const newArray = array.slice();
    const [item] = newArray.splice(from, 1);
    newArray.splice(to, 0, item);
    return newArray;
}


interface CategoryTreeItemProps {
    category: Category;
    level: number;
    onEdit: (category: Category) => void;
    onDelete: (categoryId: string) => void;
    onMove: (categoryId: string, direction: 'up' | 'down') => void;
    allCategories: Category[];
    isFirst: boolean;
    isLast: boolean;
}

// Componente recursivo para renderizar cada item da árvore
const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  category,
  level,
  onEdit,
  onDelete,
  onMove,
  allCategories,
  isFirst,
  isLast,
}) => {
  const children = useMemo(() => {
    return allCategories
        .filter((c) => c.parentId === category.id)
        .sort((a, b) => a.order - b.order);
  }, [allCategories, category.id]);

  return (
    <div className="my-1">
      <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50" style={{ marginLeft: `${level * 2}rem` }}>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onMove(category.id, 'up')} disabled={isFirst}>
                <ArrowUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onMove(category.id, 'down')} disabled={isLast}>
                <ArrowDown className="h-4 w-4" />
            </Button>
            <span className="font-medium">{category.name}</span>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDelete(category.id)}
                className="text-red-500"
              >
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {children.length > 0 && (
        <div className="border-l border-dashed ml-8 pl-4">
          {children.map((child, index) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              allCategories={allCategories}
              isFirst={index === 0}
              isLast={index === children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const fetchedCategories = await getAllCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      toast({
        title: "Erro ao buscar categorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const categoryTree = useMemo(() => {
    return categories
      .filter((c) => !c.parentId)
      .sort((a, b) => a.order - b.order);
  }, [categories]);

  const handleAddNew = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    const children = categories.filter((c) => c.parentId === categoryId);
    if (children.length > 0) {
      toast({
        title: "Não é possível excluir",
        description:
          "Esta categoria possui subcategorias. Exclua-as primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteCategory(categoryId);
      toast({
        title: "Categoria excluída com sucesso!",
        variant: "success",
      });
      fetchCategories();
    } catch (error) {
      toast({
        title: "Erro ao excluir categoria.",
        variant: "destructive",
      });
    }
  };

  const handleMove = async (categoryId: string, direction: "up" | "down") => {
    const categoryToMove = categories.find((c) => c.id === categoryId);
    if (!categoryToMove) return;

    const siblings = categories
      .filter((c) => c.parentId === categoryToMove.parentId)
      .sort((a, b) => a.order - b.order);

    const currentIndex = siblings.findIndex((c) => c.id === categoryId);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= siblings.length) {
      return;
    }

    const reorderedSiblings = arrayMove(siblings, currentIndex, newIndex);

    const siblingUpdates = new Map<string, Partial<Category>>();
    reorderedSiblings.forEach((category, index) => {
      siblingUpdates.set(category.id, { order: index });
    });

    const originalCategories = categories;

    const newCategories = originalCategories.map((cat) => {
      const update = siblingUpdates.get(cat.id);
      if (update) {
        return { ...cat, ...update };
      }
      return cat;
    });

    // Optimistically update the UI
    setCategories(newCategories);

    const updatesForBackend = Array.from(siblingUpdates.entries()).map(
      ([id, updates]) => ({ id, updates: updates as Partial<Category> })
    );

    try {
      await updateCategoryOrder(updatesForBackend);
      toast({
        title: "Ordem atualizada com sucesso!",
        variant: "success",
      });
      // Refetch to ensure data consistency from the server
      await fetchCategories();
    } catch (error) {
      toast({
        title: "Erro ao atualizar a ordem.",
        description: "A ordem original foi restaurada.",
        variant: "destructive",
      });
      // Revert on error
      setCategories(originalCategories);
    }
  };

  const handleSuccess = () => {
    fetchCategories();
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gerenciamento de Categorias
          </h1>
          <p className="text-muted-foreground">
            Crie e organize a hierarquia do seu catálogo de bolões.
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Nova Categoria
        </Button>
      </div>

      <div className="bg-card p-4 rounded-lg border">
        {loading ? (
          <div className="text-center h-24 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : categoryTree.length > 0 ? (
          categoryTree.map((cat, index) => (
            <CategoryTreeItem
              key={cat.id}
              category={cat}
              level={0}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMove={handleMove}
              allCategories={categories}
              isFirst={index === 0}
              isLast={index === categoryTree.length - 1}
            />
          ))
        ) : (
          <div className="text-center h-24 flex items-center justify-center">
            <p>Nenhuma categoria encontrada. Comece adicionando uma!</p>
          </div>
        )}
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleSuccess}
        category={selectedCategory}
        categories={categories}
      />
    </div>
  );
}
