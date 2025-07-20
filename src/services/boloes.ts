import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
  DocumentData,
  addDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getTeamById } from "@/services/teams"; 
import { Bolao, Team } from "@/types"; 
import { isValid } from "date-fns";

type RawBolao = Omit<Bolao, 'homeTeam' | 'awayTeam'> & { homeTeamId: string; awayTeamId: string };

const safeParseDate = (dateInput: any): Date | null => {
    if (!dateInput) return null;
    // @ts-ignore
    if (typeof dateInput.toDate === 'function') return dateInput.toDate();
    const date = new Date(dateInput);
    return isValid(date) ? date : null;
};

const fromFirestore = async (docSnap: DocumentData): Promise<Bolao> => {
  const data = docSnap.data();
  
  const homeTeamId = data.homeTeamId || data.teamAId;
  const awayTeamId = data.awayTeamId || data.teamBId;

  let homeTeam: Team | null = null;
  let awayTeam: Team | null = null;

  if (homeTeamId) {
    homeTeam = await getTeamById(homeTeamId);
  }
  if (awayTeamId) {
    awayTeam = await getTeamById(awayTeamId);
  }

  return {
    id: docSnap.id,
    championshipId: data.championshipId,
    championship: data.championship,
    homeTeam: homeTeam || { id: homeTeamId, name: 'Time Desconhecido', logoUrl: '', level: 'Amador/Várzea', location: '', scope: 'Nacional' }, 
    awayTeam: awayTeam || { id: awayTeamId, name: 'Time Desconhecido', logoUrl: '', level: 'Amador/Várzea', location: '', scope: 'Nacional' }, 
    matchStartDate: safeParseDate(data.matchStartDate)!,
    matchEndDate: safeParseDate(data.matchEndDate)!,
    closingTime: data.closingTime,
    betAmount: data.betAmount,
    initialPrize: data.initialPrize || 0,
    status: data.status || 'Aberto',
    categoryIds: data.categoryIds || [],
    userGuess: data.userGuess,
  };
};

export const getBoloes = async (): Promise<Bolao[]> => {
  try {
    const boloesSnapshot = await getDocs(collection(db, "boloes"));
    const boloesWithTeams = await Promise.all(boloesSnapshot.docs.map(fromFirestore));
    return boloesWithTeams;
  } catch (error) {
    console.error("Erro ao buscar bolões: ", error);
    throw new Error("Não foi possível buscar os bolões.");
  }
};

export const getBoloesByCategoryId = async (categoryId: string): Promise<Bolao[]> => {
    try {
      const q = query(collection(db, "boloes"), where("categoryIds", "array-contains", categoryId));
      const querySnapshot = await getDocs(q);
      const boloesWithTeams = await Promise.all(querySnapshot.docs.map(fromFirestore));
      return boloesWithTeams;
    } catch (error) {
      console.error("Erro ao buscar bolões por categoria: ", error);
      throw new Error("Não foi possível buscar os bolões para esta categoria.");
    }
};

export const getBolaoById = async (id: string): Promise<Bolao | null> => {
    if (!id) return null;
    try {
      const docSnap = await getDoc(doc(db, 'boloes', id));
      if (docSnap.exists()) {
        return await fromFirestore(docSnap);
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar bolão pelo ID: ", error);
      throw new Error("Não foi possível buscar os dados do bolão.");
    }
};

export const addBolao = async (data: Omit<Bolao, "id" | "status">): Promise<string> => {
  try {
    const { homeTeam, awayTeam, ...rest } = data;
    const docRef = await addDoc(collection(db, "boloes"), {
      ...rest,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      status: "Aberto",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar bolão: ", error);
    throw new Error("Não foi possível adicionar o bolão.");
  }
};

export const updateBolao = async (
  id: string,
  data: Partial<Omit<Bolao, "id" | "createdAt" | "status">>
): Promise<void> => {
  try {
    const { homeTeam, awayTeam, ...rest } = data;
    const bolaoRef = doc(db, "boloes", id);
    const dataToUpdate: any = { ...rest };
    if (homeTeam) dataToUpdate.homeTeamId = homeTeam.id;
    if (awayTeam) dataToUpdate.awayTeamId = awayTeam.id;
    await updateDoc(bolaoRef, dataToUpdate);
  } catch (error) {
    console.error("Erro ao atualizar bolão: ", error);
    throw new Error("Não foi possível atualizar o bolão.");
  }
};

export const deleteBolao = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "boloes", id));
    } catch (error) {
      console.error("Erro ao deletar bolão: ", error);
      throw new Error("Não foi possível deletar o bolão.");
    }
};