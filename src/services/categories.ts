import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
  parentId: string | null; // ID da categoria pai, ou null para raiz
  createdAt?: Timestamp;
}

const categoriesCollection = collection(db, "categories");

export const createCategory = async (
  categoryData: Omit<Category, "id" | "createdAt">
): Promise<string> => {
  const docRef = await addDoc(categoriesCollection, {
    ...categoryData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getAllCategories = async (): Promise<Category[]> => {
  const q = query(categoriesCollection, orderBy("order", "asc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Category)
  );
};

export const updateCategory = async (
  categoryId: string,
  updates: Partial<Omit<Category, "id" | "createdAt">>
): Promise<void> => {
  const categoryDoc = doc(db, "categories", categoryId);
  await updateDoc(categoryDoc, updates);
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const categoryDoc = doc(db, "categories", categoryId);
  await deleteDoc(categoryDoc);
};

export const updateCategoryOrder = async (
  updates: { id: string; updates: Partial<Category> }[]
): Promise<void> => {
  const batch = writeBatch(db);
  updates.forEach(({ id, updates }) => {
    const categoryDoc = doc(db, "categories", id);
    batch.update(categoryDoc, updates);
  });
  await batch.commit();
};
