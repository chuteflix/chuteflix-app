
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
  setDoc,
} from "firebase/firestore"
import { uploadFile } from "./storage"

export interface Team {
  id: string
  name: string
  shieldUrl?: string
  state?: string
  city?: string
}

// Tipos para os dados do formulário, incluindo o arquivo
export type TeamData = {
  name: string
  state: string
  city: string
  shieldFile?: File | null
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

// Adiciona um novo time com upload de escudo
export const addTeam = async (data: TeamData): Promise<Team> => {
  try {
    const { shieldFile, ...teamData } = data
    let shieldUrl = ""

    // 1. Gera uma referência de documento para obter um ID único
    const newTeamRef = doc(collection(db, "teams"))
    const teamId = newTeamRef.id

    // 2. Se um escudo foi fornecido, faz o upload para o Storage
    if (shieldFile) {
      const path = `teams/${teamId}/shield.png`
      shieldUrl = await uploadFile(shieldFile, path)
    }

    // 3. Cria o documento no Firestore com os dados e a URL do escudo
    const newTeam = {
      ...teamData,
      shieldUrl,
      createdAt: serverTimestamp(),
    }
    await setDoc(newTeamRef, newTeam)

    return { id: teamId, ...teamData, shieldUrl }
  } catch (error) {
    throw new Error("Não foi possível adicionar o time.")
  }
}

export const getTeams = async (): Promise<Team[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "teams"))
    return querySnapshot.docs.map(fromFirestore)
  } catch (error) {
    throw new Error("Não foi possível buscar os times.")
  }
}

export const getTeamById = async (id: string): Promise<Team | undefined> => {
    if (!id) return undefined;
    try {
      const docRef = doc(db, 'teams', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return fromFirestore(docSnap);
      }
      return undefined;
    } catch (error) {
      throw new Error("Não foi possível buscar os dados do time.");
    }
};

// Atualiza um time, com upload de um novo escudo se fornecido
export const updateTeam = async (
  id: string,
  data: Partial<TeamData>
): Promise<void> => {
  try {
    const { shieldFile, ...teamData } = data
    const finalData: Partial<Team> = { ...teamData }

    // Se um novo escudo foi fornecido, faz o upload
    if (shieldFile) {
      const path = `teams/${id}/shield.png`
      finalData.shieldUrl = await uploadFile(shieldFile, path)
    }

    const teamRef = doc(db, "teams", id)
    await updateDoc(teamRef, finalData)
  } catch (error) {
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
    throw new Error("Não foi possível deletar o time.")
  }
}
