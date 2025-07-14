
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore"
import { Championship } from "@/types" // Import from types/index.ts

// Função para converter dados do Firestore para o tipo Championship
const fromFirestore = (doc: DocumentData): Championship => {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name,
    type: data.type,
    competitionType: data.competitionType,
    scope: data.scope,
    series: data.series,
    state: data.state,
    city: data.city,
    continent: data.continent,
    country: data.country,
  }
}

export const addChampionship = async (
  data: Omit<Championship, "id">
): Promise<Championship> => {
  try {
    const docRef = await addDoc(collection(db, "championships"), {
      ...data,
      createdAt: serverTimestamp(),
    })
    // Create a new object for the return value to avoid passing non-serializable data
    const returnData: Championship = {
      id: docRef.id,
      ...data,
    };
    return returnData;
  } catch (error) {
    console.error("Erro ao adicionar campeonato: ", error)
    throw new Error("Não foi possível adicionar o campeonato.")
  }
}

export const getChampionships = async (): Promise<Championship[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "championships"))
    return querySnapshot.docs.map(fromFirestore)
  } catch (error) {
    console.error("Erro ao buscar campeonatos: ", error)
    throw new Error("Não foi possível buscar os campeonatos.")
  }
}

export const getChampionshipById = async (id: string): Promise<Championship | undefined> => {
    if (!id) return undefined;
    try {
      const docRef = doc(db, 'championships', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return fromFirestore(docSnap);
      }
      return undefined;
    } catch (error) {
      console.error("Erro ao buscar campeonato pelo ID: ", error);
      throw new Error("Não foi possível buscar os dados do campeonato.");
    }
};

export const updateChampionship = async (
  id: string,
  data: Partial<Omit<Championship, "id">>
): Promise<void> => {
  try {
    const championshipRef = doc(db, "championships", id)
    await updateDoc(championshipRef, data)
  } catch (error) {
    console.error("Erro ao atualizar campeonato: ", error)
    throw new Error("Não foi possível atualizar o campeonato.")
  }
}

export const deleteChampionship = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error("O ID do campeonato é obrigatório para deletar.")
  }
  try {
    const championshipRef = doc(db, "championships", id)
    await deleteDoc(championshipRef)
  } catch (error) {
    console.error("Erro ao deletar o campeonato.")
    throw new Error("Não foi possível deletar o campeonato.")
  }
}
