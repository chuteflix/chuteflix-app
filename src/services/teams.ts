
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
} from "firebase/firestore";
import { uploadFileToApi } from "./upload"; // CORRIGIDO: Usa a nova função de cliente
import { Team } from "@/types";

export type TeamData = {
  name: string;
  state: string;
  city: string;
  shieldFile?: File | null;
  level: 'Profissional' | 'Amador/Várzea';
  scope: 'Nacional' | 'Estadual' | 'Municipal';
  location: string;
};

const fromFirestore = (doc: DocumentData): Team => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    shieldUrl: data.shieldUrl || '', // CORREÇÃO AQUI: Mapear para shieldUrl
    state: data.state,
    city: data.city,
    level: data.level,
    scope: data.scope,
    location: data.location,
  };
};

export const addTeam = async (data: TeamData): Promise<Team> => {
  try {
    const { shieldFile, ...rest } = data;
    let shieldUrl = "";

    if (shieldFile) {
      shieldUrl = await uploadFileToApi(shieldFile); // Usa a nova função que chama a API Route
    }

    const newTeamRef = doc(collection(db, "teams"));
    const newTeam = {
      ...rest,
      shieldUrl,
      createdAt: serverTimestamp(),
    };
    await setDoc(newTeamRef, newTeam);

    // Retorna o objeto Team consistente com a interface
    return { id: newTeamRef.id, ...rest, shieldUrl: shieldUrl };
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

export const updateTeam = async (
  id: string,
  data: Partial<TeamData>
): Promise<void> => {
  try {
    const { shieldFile, ...rest } = data;
    
    const finalData: { [key: string]: any } = { ...rest };

    if (shieldFile) {
      finalData.shieldUrl = await uploadFileToApi(shieldFile); // Usa a nova função que chama a API Route
    }

    const teamRef = doc(db, "teams", id);
    await updateDoc(teamRef, finalData);
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
