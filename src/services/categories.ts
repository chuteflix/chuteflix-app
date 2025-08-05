
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
import { getBoloes } from "./boloes" 

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
    boloes: [], 
    children: [],
  }
}

export const getBaseCategories = async (includeInactive = false): Promise<Category[]> => {
  const categoriesCollection = collection(db, "categories");
  let categoriesQuery = query(categoriesCollection, orderBy("order"));
  if (!includeInactive) {
    categoriesQuery = query(categoriesQuery, where("active", "==", true));
  }
  const categoriesSnapshot = await getDocs(categoriesQuery);
  return categoriesSnapshot.docs.map(fromFirestore);
};

export const getAllCategories = async (
  includeInactive = false
): Promise<Category[]> => {
  
  const [allCategories, allBoloes] = await Promise.all([
    getBaseCategories(includeInactive),
    includeInactive ? Promise.resolve([]) : getBoloes("Aberto") 
  ]);

  const categoryMap = new Map(allCategories.map(c => [c.id, { ...c, boloes: [], children: [] }]));

  if (!includeInactive) {
      allBoloes.forEach(bolao => {
        bolao.categoryIds.forEach(catId => {
            const category = categoryMap.get(catId);
            if (category) {
                category.boloes.push(bolao);
            }
        });
      });
  }

  const rootCategories: Category[] = []
  categoryMap.forEach(category => {
    if (category.parentId && categoryMap.has(category.parentId)) {
      const parent = categoryMap.get(category.parentId)!
      parent.children!.push(category)
    } else {
      rootCategories.push(category)
    }
  });

  return rootCategories.map(c => ({ ...c, boloes: c.boloes || [] }));
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

const getBoloesByCategoryId = async (categoryId: string): Promise<Bolao[]> => {
    try {
        const allBoloes = await getBoloes("Aberto");
        return allBoloes.filter(bolao => bolao.categoryIds && bolao.categoryIds.includes(categoryId));
    } catch (error) {
        console.error("Erro ao buscar bolões por categoria:", error);
        return [];
    }
};
