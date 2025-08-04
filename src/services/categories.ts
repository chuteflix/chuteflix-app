
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
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Bolao } from "@/types"

export interface Category {
  id: string
  name: string
  description: string
  active: boolean
  order: number
  parentId?: string | null
  boloes: Bolao[]
  children?: Category[]
}

const fromFirestore = (doc: DocumentData): Category => {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name,
    description: data.description,
    active: data.active ?? true,
    order: data.order ?? 0,
    parentId: data.parentId || null,
    boloes: [],
    children: [],
  }
}

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
  
  const categoryMap = new Map(allCategories.map(c => [c.id, c]))
  const rootCategories: Category[] = []

  allCategories.forEach(category => {
    if (category.parentId && categoryMap.has(category.parentId)) {
      const parent = categoryMap.get(category.parentId)!
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(category)
    } else {
      rootCategories.push(category)
    }
  })

  // Fetch boloes for all relevant categories
  for (const category of allCategories) {
    if (category.active || includeInactive) {
      const boloesCollection = collection(db, "boloes")
      const boloesQuery = query(
        boloesCollection,
        where("category", "==", category.id),
        where("status", "==", "open")
      )
      const boloesSnapshot = await getDocs(boloesQuery)
      category.boloes = boloesSnapshot.docs.map(
        bolaoDoc => ({ ...bolaoDoc.data(), id: bolaoDoc.id } as Bolao)
      )
    }
  }

  return rootCategories
}

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
