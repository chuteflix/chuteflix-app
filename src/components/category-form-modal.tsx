"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Category, createCategory, updateCategory, getAllCategories } from "@/services/categories";

const formSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  order: z.coerce.number().min(1, "A ordem deve ser no mínimo 1."),
  parentId: z.string().nullable().optional(),
});

type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  category: Category | null;
}

export function CategoryFormModal({
  isOpen,
  onOpenChange,
  onSuccess,
  category,
}: CategoryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableParents, setAvailableParents] = useState<Category[]>([]);
  const { toast } = useToast();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      order: 1,
      parentId: null,
    },
  });

  useEffect(() => {
    const fetchParentCategories = async () => {
        const allCategories = await getAllCategories();
        setAvailableParents(allCategories.filter(c => c.id !== category?.id));
    }
    if (isOpen) {
        fetchParentCategories();
    }
  }, [isOpen, category]);

  useEffect(() => {
    if (isOpen) {
        if (category) {
        form.reset({
            name: category.name,
            description: category.description || "",
            order: category.order,
            parentId: category.parentId || null,
        });
        } else {
        form.reset({
            name: "",
            description: "",
            order: 1,
            parentId: null,
        });
        }
    }
  }, [category, form, isOpen]);

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    // Garantir que parentId seja null se for uma string vazia
    const dataToSave = {
        ...values,
        parentId: values.parentId || null,
    };
    try {
      if (category) {
        await updateCategory(category.id, dataToSave);
        toast({
          title: "Categoria atualizada com sucesso!",
          variant: "default",
        });
      } else {
        await createCategory(dataToSave);
        toast({
          title: "Categoria criada com sucesso!",
          variant: "default",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro ao salvar categoria.",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Adicionar Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes da categoria. A ordem define a posição na home.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria Pai (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Nenhuma (Categoria Principal)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Removido o item com valor vazio para corrigir o erro */}
                      {availableParents.map(parent => (
                        <SelectItem key={parent.id} value={parent.id}>{parent.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Brasileirão Série A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Uma breve descrição para controle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem de Exibição</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {category ? "Salvar Alterações" : "Criar Categoria"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
