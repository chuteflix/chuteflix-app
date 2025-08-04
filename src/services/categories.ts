
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  DocumentData,
  getDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Bolao, Category } from "@/types"
import { getBoloes } from "./boloes" // Importar a função de buscar bolões

// Re-exporting the type
export type { Category };

const fromFirestore = (doc: DocumentData): Category => {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name,
    description: data.description,
    active: data.active ?? true,
    order: data.order ?? 0,
    parentId: data.parentId || null,
    // Inicializa as propriedades que serão preenchidas depois
    boloes: [], 
    children: [],
  }
}

// Versão otimizada que busca tudo e monta a árvore em memória
export const getAllCategories = async (
  includeInactive = false
): Promise<Category[]> => {
  
  // 1. Criar as queries em paralelo
  const categoriesCollection = collection(db, "categories")
  let categoriesQuery = query(categoriesCollection, orderBy("order"))
  if (!includeInactive) {
    categoriesQuery = query(categoriesQuery, where("active", "==", true))
  }

  // Busca categorias e bolões ao mesmo tempo
  const [categoriesSnapshot, allBoloes] = await Promise.all([
    getDocs(categoriesQuery),
    // Apenas busca bolões se for para exibir na home (não inativos)
    includeInactive ? Promise.resolve([]) : getBoloes() 
  ]);

  const allCategories: Category[] = categoriesSnapshot.docs.map(fromFirestore)
  const categoryMap = new Map(allCategories.map(c => [c.id, c]))

  // 2. Associar bolões às suas categorias
  if (!includeInactive) {
      allBoloes.forEach(bolao => {
        bolao.categoryIds.forEach(catId => {
            if (categoryMap.has(catId)) {
                categoryMap.get(catId)!.boloes!.push(bolao);
            }
        });
      });
  }

  // 3. Montar a árvore hierárquica
  const rootCategories: Category[] = []
  allCategories.forEach(category => {
    if (category.parentId && categoryMap.has(category.parentId)) {
      const parent = categoryMap.get(category.parentId)!
      parent.children!.push(category)
    } else {
      rootCategories.push(category)
    }
  })

  return rootCategories
}


export const getCategoryById = async (id: string): Promise<Category | null> => {
  if (!id) return null;
  const docRef = doc(db, "categories", id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
      return null;
  }

  const category = fromFirestore(docSnap);
  const boloes = await getBoloesByCategoryId(id);
  category.boloes = boloes;

  return category;
};


export const addCategory = async (
  data: Omit<Category, "id" | "boloes" | "children">
) => {
  await addDoc(collection(db, "categories"), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export const updateCategory = async (
  id: string,
  data: Partial<Omit<Category, "id" | "boloes" | "children">>
) => {
  const categoryRef = doc(db, "categories", id)
  await updateDoc(categoryRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const deleteCategory = async (id: string) => {
  await deleteDoc(doc(db, "categories", id))
}

export const updateCategoryOrder = async (categoryIds: string[]) => {
  const batch = writeBatch(db)
  categoryIds.forEach((id, index) => {
    const categoryRef = doc(db, "categories", id)
    batch.update(categoryRef, { order: index })
  })
  await batch.commit()
}

// Função auxiliar para buscar bolões por categoria, usada no getCategoryById
const getBoloesByCategoryId = async (categoryId: string): Promise<Bolao[]> => {
    try {
        const allBoloes = await getBoloes();
        // Filtra os bolões que contêm o ID da categoria
        return allBoloes.filter(bolao => bolao.categoryIds && bolao.categoryIds.includes(categoryId));
    } catch (error) {
        console.error("Erro ao buscar bolões por categoria:", error);
        return []; // Retorna array vazio em caso de erro
    }
};

