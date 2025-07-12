
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"

export interface Team {
  id: string
  name: string
  championshipId: string
}

export const addTeam = async (
  name: string,
  championshipId: string
): Promise<Team> => {
  if (!name || !championshipId) {
    throw new Error("Nome do time e ID do campeonato são obrigatórios.")
  }

  try {
    const docRef = await addDoc(collection(db, "teams"), {
      name,
      championshipId,
      createdAt: serverTimestamp(),
    })
    return { id: docRef.id, name, championshipId }
  } catch (error) {
    console.error("Erro ao adicionar time: ", error)
    throw new Error("Não foi possível adicionar o time.")
  }
}

export const getTeams = async (): Promise<Team[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "teams"))
    return querySnapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Team)
    )
  } catch (error) {
    console.error("Erro ao buscar times: ", error)
    throw new Error("Não foi possível buscar os times.")
  }
}

export const updateTeam = async (
  id: string,
  name: string,
  championshipId: string
): Promise<void> => {
  if (!id || !name || !championshipId) {
    throw new Error(
      "ID, nome do time e ID do campeonato são obrigatórios para atualizar."
    )
  }

  try {
    const teamRef = doc(db, "teams", id)
    await updateDoc(teamRef, {
      name,
      championshipId,
    })
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
    console.error("Erro ao deletar time: ", error)
    throw new Error("Não foi possível deletar o time.")
  }
}
