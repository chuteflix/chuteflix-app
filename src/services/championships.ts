import { doc, getDoc, collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Championship } from "@/types";

const fromFirestore = (doc: DocumentData): Championship => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    logoUrl: data.logoUrl || '',
  };
};

export const getChampionshipById = async (id: string): Promise<Championship | null> => {
  if (!id) return null;
  try {
    const docRef = doc(db, "championships", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return fromFirestore(docSnap);
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar dados do campeonato:", error);
    throw new Error("Não foi possível buscar os dados do campeonato.");
  }
};

export const getAllChampionships = async (): Promise<Championship[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "championships"));
      return querySnapshot.docs.map(fromFirestore);
    } catch (error) {
      console.error("Erro ao buscar todos os campeonatos:", error);
      throw new Error("Não foi possível buscar os campeonatos.");
    }
};
