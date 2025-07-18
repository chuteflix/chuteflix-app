"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Category,
  getAllCategories,
  deleteCategory,
} from "@/services/categories";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Trash, Pencil, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoryFormModal } from "@/components/category-form-modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

// Componente recursivo para renderizar cada item da árvore
const CategoryTreeItem = ({ category, level, onEdit, onDelete, allCategories }) => {
    const children = allCategories.filter(c => c.parentId === category.id);
  
    return (
      <>
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
          <div className="flex items-center">
            <span style={{ marginLeft: `${level * 2}rem` }} className="font-medium">
              {category.name}
            </span>
            <span className="ml-4 text-xs text-muted-foreground">(Ordem: {category.order})</span>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(category)}
            >
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
          <div className="border-l border-dashed ml-4">
             {children.map(child => (
                <CategoryTreeItem 
                    key={child.id}
                    category={child}
                    level={level + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    allCategories={allCategories}
                />
            ))}
          </div>
        )}
      </>
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

  const rootCategories = useMemo(() => {
    return categories.filter(c => !c.parentId).sort((a,b) => a.order - b.order);
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
    // Adicionar lógica para verificar se a categoria tem filhos antes de excluir
    const children = categories.filter(c => c.parentId === categoryId);
    if (children.length > 0) {
        toast({
            title: "Não é possível excluir",
            description: "Esta categoria possui subcategorias. Exclua-as primeiro.",
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
        ) : rootCategories.length > 0 ? (
            rootCategories.map(cat => (
                <CategoryTreeItem 
                    key={cat.id}
                    category={cat}
                    level={0}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    allCategories={categories}
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
      />
    </div>
  );
}
