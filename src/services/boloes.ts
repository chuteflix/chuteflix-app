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
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getTeamById } from "@/services/teams"; 
import { Bolao, Team } from "@/types"; 
import { isValid, isPast } from "date-fns"; 
import { getAllCategories } from "./categories";

const safeParseDate = (dateInput: any): Date | null => {
    if (!dateInput) return null;
    // @ts-ignore
    if (typeof dateInput.toDate === 'function') return dateInput.toDate();
    const date = new Date(dateInput);
    return isValid(date) ? date : null;
};

const fromFirestore = async (docSnap: DocumentData): Promise<Bolao> => {
  const data = docSnap.data();
  
  const homeTeamId = data.homeTeamId;
  const awayTeamId = data.awayTeamId;

  let homeTeam: Team | null = null;
  let awayTeam: Team | null = null;

  if (homeTeamId) {
    homeTeam = await getTeamById(homeTeamId);
  }
  if (awayTeamId) {
    awayTeam = await getTeamById(awayTeamId);
  }

  const allCategories = await getAllCategories();
  const categoryNames = data.categoryIds
    ?.map((id: string) => allCategories.find(cat => cat.id === id)?.name)
    .filter(Boolean) || [];


  const defaultHomeTeam: Team = homeTeam || { id: homeTeamId || 'unknown_home_team', name: 'Time Desconhecido', shieldUrl: '', level: 'Amador/Várzea', location: '', scope: 'Nacional' }; 
  const defaultAwayTeam: Team = awayTeam || { id: awayTeamId || 'unknown_away_team', name: 'Time Desconhecido', shieldUrl: '', level: 'Amador/Várzea', location: '', scope: 'Nacional' }; 

  return {
    id: docSnap.id,
    homeTeam: defaultHomeTeam, 
    awayTeam: defaultAwayTeam, 
    matchStartDate: safeParseDate(data.matchStartDate),
    matchEndDate: safeParseDate(data.matchEndDate),
    closingTime: safeParseDate(data.closingTime),
    betAmount: data.betAmount,
    initialPrize: data.initialPrize || 0,
    status: data.status || 'Aberto',
    homeScore: data.finalScoreTeam1,
    awayScore: data.finalScoreTeam2,
    categoryIds: data.categoryIds || [],
    categoryNames: categoryNames,
    userGuess: data.userGuess,
    finalScoreTeam1: data.finalScoreTeam1, 
    finalScoreTeam2: data.finalScoreTeam2, 
    championship: (await getAllCategories()).find(c => c.id === data.categoryIds?.[0])?.name || 'Campeonato',
  };
};

const filterAvailableBoloes = (boloes: Bolao[]): Bolao[] => {
  const now = new Date();
  return boloes.filter(bolao => {
    const closingTime = bolao.closingTime; 
    return bolao.status === 'Aberto' && isValid(closingTime) && !isPast(closingTime);
  });
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

export const getFinishedBoloes = async (): Promise<Bolao[]> => {
  try {
    const q = query(
      collection(db, "boloes"), 
      where("status", "==", "Finalizado"),
      orderBy("matchStartDate", "desc"),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    const boloes = await Promise.all(querySnapshot.docs.map(fromFirestore));
    return boloes.filter(b => b.homeScore !== undefined && b.awayScore !== undefined);
  } catch (error) {
    console.error("Erro ao buscar bolões finalizados: ", error);
    throw new Error("Não foi possível buscar os resultados dos jogos.");
  }
};

export const getBoloesByCategoryId = async (categoryId: string): Promise<Bolao[]> => {
    try {
      const q = query(collection(db, "boloes"), where("categoryIds", "array-contains", categoryId));
      const querySnapshot = await getDocs(q);
      const boloesWithTeams = await Promise.all(querySnapshot.docs.map(fromFirestore));
      return filterAvailableBoloes(boloesWithTeams);
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

export const addBolao = async (data: Omit<Bolao, "id" | "status" | "categoryNames" | "homeScore" | "awayScore">): Promise<string> => {
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
  data: Partial<Omit<Bolao, "id" | "createdAt" | "status" | "categoryNames">>
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
