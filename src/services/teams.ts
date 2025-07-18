
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
import { uploadFile } from "./storage";
import { Team } from "@/types"; // Importando o tipo global

export type TeamData = {
  name: string;
  state: string;
  city: string;
  shieldFile?: File | null;
  level: 'Profissional' | 'Amador/Várzea';
  scope: 'Nacional' | 'Estadual' | 'Municipal';
  location: string;
};

// Esta função agora mapeia shieldUrl para logoUrl
const fromFirestore = (doc: DocumentData): Team => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    logoUrl: data.shieldUrl || '', // A "tradução" acontece aqui
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

    const newTeamRef = doc(collection(db, "teams"));
    const teamId = newTeamRef.id;

    if (shieldFile) {
      const path = `teams/${teamId}/shield.png`;
      shieldUrl = await uploadFile(shieldFile, path);
    }

    const newTeam = {
      ...rest,
      shieldUrl, // Salva no banco como shieldUrl
      createdAt: serverTimestamp(),
    };
    await setDoc(newTeamRef, newTeam);

    return { id: teamId, ...rest, logoUrl: shieldUrl };
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
      const path = `teams/${id}/shield.png`;
      finalData.shieldUrl = await uploadFile(shieldFile, path);
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
