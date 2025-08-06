
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentData,
  setDoc,
  addDoc
} from "firebase/firestore";
import { Team } from "@/types";

// Re-export the Team type
export type { Team };

// Tipagem simplificada, pois o upload é tratado no componente
export type TeamData = {
  name: string;
  state: string;
  city: string;
  shieldUrl: string; // Apenas a URL é necessária aqui
};

const fromFirestore = (doc: DocumentData): Team => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    shieldUrl: data.shieldUrl || '',
    state: data.state,
    city: data.city,
    level: data.level,
    scope: data.scope,
    location: data.location,
  };
};

// A função de adicionar agora recebe os dados já prontos, sem o arquivo
export const addTeam = async (data: Omit<Team, 'id'>): Promise<Team> => {
  try {
    const docRef = await addDoc(collection(db, "teams"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...data,
    };
  } catch (error) {
    console.error("Erro ao adicionar time:", error);
    throw new Error("Não foi possível adicionar o time.");
  }
};

export const getTeams = async (): Promise<Team[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "teams"));
    return querySnapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Erro ao buscar times:", error);
    throw new Error("Não foi possível buscar os times.");
  }
};

export const getTeamById = async (id: string): Promise<Team | null> => {
  if (!id) return null;
  try {
    const docRef = doc(db, "teams", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return fromFirestore(docSnap);
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar dados do time:", error);
    throw new Error("Não foi possível buscar os dados do time.");
  }
};

// A função de atualizar também recebe os dados prontos
export const updateTeam = async (
  id: string,
  data: Partial<Omit<Team, 'id'>>
): Promise<void> => {
  try {
    const teamRef = doc(db, "teams", id);
    await updateDoc(teamRef, data);
  } catch (error) {
    console.error("Erro ao atualizar time:", error);
    throw new Error("Não foi possível atualizar o time.");
  }
};

export const deleteTeam = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error("O ID do time é obrigatório para deletar.");
  }
  try {
    const teamRef = doc(db, "teams", id);
    await deleteDoc(teamRef);
  } catch (error) {
    console.error("Erro ao deletar time:", error);
    throw new Error("Não foi possível deletar o time.");
  }
};
