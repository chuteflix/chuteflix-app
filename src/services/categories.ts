
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
  }
}

// Otimizado: Busca as categorias e depois monta a árvore em memória.
export const getAllCategories = async (
  includeInactive = false
): Promise<Category[]> => {
  const categoriesCollection = collection(db, "categories")
  let q = query(categoriesCollection, orderBy("order"))

  if (!includeInactive) {
    q = query(q, where("active", "==", true))
  }
  
  const querySnapshot = await getDocs(q)
  const allCategories: Category[] = querySnapshot.docs.map(fromFirestore)
  
  const categoryMap = new Map(allCategories.map(c => [c.id, {...c, children: []}]))
  const rootCategories: Category[] = []

  allCategories.forEach(category => {
    const categoryNode = categoryMap.get(category.id)!
    if (category.parentId && categoryMap.has(category.parentId)) {
      const parent = categoryMap.get(category.parentId)!
      parent.children!.push(categoryNode)
    } else {
      rootCategories.push(categoryNode)
    }
  })

  return rootCategories
}


export const getCategoryById = async (id: string): Promise<Category | null> => {
  if (!id) return null;
  const docRef = doc(db, "categories", id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? fromFirestore(docSnap) : null;
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
