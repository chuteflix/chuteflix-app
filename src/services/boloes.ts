
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
  DocumentData,
  addDoc,
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Bolao {
  id: string
  name: string
  championshipId: string
  teamAId: string
  teamBId: string
  matchDate: string 
  startTime: string 
  endTime: string
  fee: number 
  initialPrize: number 
  status: "Disponível" | "Chutes Encerrados" | "Finalizado"
  closingTime: string;
  finalScoreTeam1?: number;
  finalScoreTeam2?: number;
  createdAt: any; // Adicionado
}

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
    initialPrize: data.initialPrize || 0, 
    status: data.status,
    closingTime: data.closingTime,
    finalScoreTeam1: data.finalScoreTeam1,
    finalScoreTeam2: data.finalScoreTeam2,
    createdAt: data.createdAt, // Adicionado
  }
}

export const addBolao = async (
  data: Omit<Bolao, "id" | "status" | "createdAt">
): Promise<Bolao> => {
  try {
    const docRef = await addDoc(collection(db, "boloes"), {
      ...data,
      status: "Disponível",
      createdAt: serverTimestamp(),
    })
    return {
      id: docRef.id,
      ...data,
      status: "Disponível",
      createdAt: new Date(), // Simulação do timestamp
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
  data: Partial<Omit<Bolao, "id" | "createdAt">>
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
