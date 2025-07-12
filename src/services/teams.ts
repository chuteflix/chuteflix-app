
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

export interface Team {
  id: string
  name: string
  shieldUrl?: string
  state?: string
  city?: string
}

// Função para converter dados do Firestore
const fromFirestore = (doc: DocumentData): Team => {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name,
    shieldUrl: data.shieldUrl,
    state: data.state,
    city: data.city,
  }
}

export const addTeam = async (data: Omit<Team, "id">): Promise<Team> => {
  try {
    const docRef = await addDoc(collection(db, "teams"), {
      ...data,
      createdAt: serverTimestamp(),
    })
    return {
      id: docRef.id,
      ...data,
    }
  } catch (error) {
    console.error("Erro ao adicionar time: ", error)
    throw new Error("Não foi possível adicionar o time.")
  }
}

export const getTeams = async (): Promise<Team[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "teams"))
    return querySnapshot.docs.map(fromFirestore)
  } catch (error) {
    console.error("Erro ao buscar times: ", error)
    throw new Error("Não foi possível buscar os times.")
  }
}

export const updateTeam = async (
  id: string,
  data: Partial<Omit<Team, "id">>
): Promise<void> => {
  try {
    const teamRef = doc(db, "teams", id)
    await updateDoc(teamRef, data)
  } catch (error) {
    console.error("Erro ao atualizar time: ", error)
    throw new Error("Não foi possível atualizar o time.")
  }
}

export const deleteTeam = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error("O ID do time é obrigatório para deletar.")
  }
  try {
    const teamRef = doc(db, "teams", id)
    await deleteDoc(teamRef)
  } catch (error) {
    console.error("Erro ao deletar o time: ", error)
    throw new Error("Não foi possível deletar o time.")
  }
}
