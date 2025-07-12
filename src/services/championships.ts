
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore"

export interface Championship {
  id: string
  name: string
  type: "professional" | "amateur"
  scope?: "national" | "state" | "municipal"
  series?: "A" | "B" | "C" | "D"
  state?: string
  city?: string
}

// Função para converter dados do Firestore para o tipo Championship
const fromFirestore = (doc: DocumentData): Championship => {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name,
    type: data.type,
    scope: data.scope,
    series: data.series,
    state: data.state,
    city: data.city,
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
    return {
      id: docRef.id,
      ...data,
    }
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
