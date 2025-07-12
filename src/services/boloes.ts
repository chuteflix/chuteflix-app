
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
  Timestamp,
} from "firebase/firestore"

export interface Bolao {
  id: string
  name: string
  championshipId: string
  teamAId: string
  teamBId: string
  matchDate: Timestamp
  fee: number
  prize: number
  status: "Ativo" | "Em breve" | "Finalizado"
}

// Função para converter dados do Firestore para o tipo Bolao
const fromFirestore = (doc: DocumentData): Bolao => {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name,
    championshipId: data.championshipId,
    teamAId: data.teamAId,
    teamBId: data.teamBId,
    matchDate: data.matchDate,
    fee: data.fee,
    prize: data.prize,
    status: data.status,
  }
}

export const addBolao = async (
  data: Omit<Bolao, "id" | "status" | "matchDate"> & { matchDate: string }
): Promise<Bolao> => {
  try {
    const docRef = await addDoc(collection(db, "boloes"), {
      ...data,
      matchDate: Timestamp.fromDate(new Date(data.matchDate)),
      status: "Em breve", // Todo novo bolão começa como 'Em breve'
      createdAt: serverTimestamp(),
    })

    const newBolaoData = {
      ...data,
      id: docRef.id,
      status: "Em breve" as const,
      matchDate: Timestamp.fromDate(new Date(data.matchDate)),
    }

    return newBolaoData
  } catch (error) {
    console.error("Erro ao adicionar bolão: ", error)
    throw new Error("Não foi possível adicionar o bolão.")
  }
}

export const getBoloes = async (): Promise<Bolao[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "boloes"))
    return querySnapshot.docs.map(fromFirestore)
  } catch (error) {
    console.error("Erro ao buscar bolões: ", error)
    throw new Error("Não foi possível buscar os bolões.")
  }
}

export const updateBolao = async (
  id: string,
  data: Partial<Omit<Bolao, "id">>
): Promise<void> => {
  try {
    const bolaoRef = doc(db, "boloes", id)
    const updateData: any = { ...data }
    if (data.matchDate && typeof data.matchDate === "string") {
      updateData.matchDate = Timestamp.fromDate(new Date(data.matchDate))
    }
    await updateDoc(bolaoRef, updateData)
  } catch (error) {
    console.error("Erro ao atualizar bolão: ", error)
    throw new Error("Não foi possível atualizar o bolão.")
  }
}

export const deleteBolao = async (id: string): Promise<void> => {
  try {
    const bolaoRef = doc(db, "boloes", id)
    await deleteDoc(bolaoRef)
  } catch (error) {
    console.error("Erro ao deletar bolão: ", error)
    throw new Error("Não foi possível deletar o bolão.")
  }
}
