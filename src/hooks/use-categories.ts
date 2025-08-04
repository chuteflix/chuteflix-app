
import { useState, useEffect } from "react"
import { Category, getAllCategories } from "@/services/categories"
import { useToast } from "./use-toast"

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const activeCategories = await getAllCategories(false) // Fetch only active categories
        setCategories(activeCategories)
      } catch (error) {
        toast({
          title: "Erro ao buscar categorias",
          description: "Não foi possível carregar as categorias.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  return { categories, loading }
}
