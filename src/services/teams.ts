
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

export interface Team {
  id: string;
  name: string;
  shieldUrl?: string;
  state?: string;
  city?: string;
}

export type TeamData = {
  name: string;
  state: string;
  city: string;
  shieldFile?: File | null;
};

const fromFirestore = (doc: DocumentData): Team => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    shieldUrl: data.shieldUrl,
    state: data.state,
    city: data.city,
  };
};

export const addTeam = async (data: TeamData): Promise<Team> => {
  try {
    const { shieldFile, name, state, city } = data;
    let shieldUrl = "";

    const newTeamRef = doc(collection(db, "teams"));
    const teamId = newTeamRef.id;

    if (shieldFile) {
      const path = `teams/${teamId}/shield.png`;
      shieldUrl = await uploadFile(shieldFile, path);
    }

    const newTeam = {
      name,
      state,
      city,
      shieldUrl,
      createdAt: serverTimestamp(),
    };
    await setDoc(newTeamRef, newTeam);

    return { id: teamId, name, state, city, shieldUrl };
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

export const getTeamById = async (id: string): Promise<Team | undefined> => {
  if (!id) return undefined;
  try {
    const docRef = doc(db, "teams", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return fromFirestore(docSnap);
    }
    return undefined;
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
    const { shieldFile, name, state, city } = data;
    
    const finalData: {
      name?: string;
      state?: string;
      city?: string;
      shieldUrl?: string;
    } = {};

    if (name) finalData.name = name;
    if (state) finalData.state = state;
    if (city) finalData.city = city;

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
