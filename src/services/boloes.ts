
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc, // Importar getDoc
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
  matchDate: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  fee: number // Valor da aposta
  prize: number // Prêmio
  status: "Aberto" | "Em breve" | "Finalizado"
  closingDate: string;
}

// Função para converter dados do Firestore
const fromFirestore = (doc: DocumentData): Bolao => {
  const data = doc.data()
  return {
    id: doc.id,
    name: data.name,
    championshipId: data.championshipId,
    teamAId: data.teamAId,
    teamBId: data.teamBId,
    matchDate: data.matchDate,
    startTime: data.startTime,
    endTime: data.endTime,
    fee: data.fee,
    prize: data.prize,
    status: data.status,
    closingDate: data.closingDate,
  }
}

export const addBolao = async (
  data: Omit<Bolao, "id" | "status">
): Promise<Bolao> => {
  try {
    const docRef = await addDoc(collection(db, "boloes"), {
      ...data,
      status: "Em breve",
      createdAt: serverTimestamp(),
    })
    return {
      id: docRef.id,
      ...data,
      status: "Em breve",
    }
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

// Nova função para buscar um bolão pelo ID
export const getBolaoById = async (id: string): Promise<Bolao | undefined> => {
    if (!id) return undefined;
    try {
      const docRef = doc(db, 'boloes', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return fromFirestore(docSnap);
      }
      return undefined;
    } catch (error) {
      console.error("Erro ao buscar bolão pelo ID: ", error);
      throw new Error("Não foi possível buscar os dados do bolão.");
    }
};

export const updateBolao = async (
  id: string,
  data: Partial<Omit<Bolao, "id">>
): Promise<void> => {
  try {
    const bolaoRef = doc(db, "boloes", id)
    await updateDoc(bolaoRef, data)
  } catch (error) {
    console.error("Erro ao atualizar bolão: ", error)
    throw new Error("Não foi possível atualizar o bolão.")
  }
}

export const deleteBolao = async (id: string): Promise<void> => {
  try {
    const bolaoRef = doc(db, "boloes", id)
    await deleteDoc(bolaoRef)
  } catch (error)
 {
    console.error("Erro ao deletar bolão: ", error)
    throw new Error("Não foi possível deletar o bolão.")
  }
}
