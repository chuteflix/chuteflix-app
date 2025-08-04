
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
import { getAllCategories, Category } from "./categories";

// Re-exportando os tipos para que possam ser importados de "@/services/boloes"
export type { Bolao, Team };

const safeParseDate = (dateInput: any): Date | null => {
    if (!dateInput) return null;
    // @ts-ignore
    if (typeof dateInput.toDate === 'function') return dateInput.toDate();
    const date = new Date(dateInput);
    return isValid(date) ? date : null;
};

const fromFirestore = (docSnap: DocumentData, allCategories: Category[]): Bolao => {
  const data = docSnap.data();

  const categoryNames = data.categoryIds
    ?.map((id: string) => allCategories.find(cat => cat.id === id)?.name)
    .filter(Boolean) || [];
  
  const homeTeam: Team = {
    id: data.homeTeamId || 'unknown_home_team',
    name: data.homeTeam?.name || 'Time A',
    shieldUrl: data.homeTeam?.shieldUrl || '',
    level: 'Profissional', 
    location: '', 
    scope: 'Nacional'
  };

  const awayTeam: Team = {
      id: data.awayTeamId || 'unknown_away_team',
      name: data.awayTeam?.name || 'Time B',
      shieldUrl: data.awayTeam?.shieldUrl || '',
      level: 'Profissional',
      location: '',
      scope: 'Nacional'
  };

  return {
    id: docSnap.id,
    homeTeam: homeTeam, 
    awayTeam: awayTeam, 
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
    championship: categoryNames[0] || 'Campeonato',
  };
};

const filterAvailableBoloes = (boloes: Bolao[]): Bolao[] => {
  const now = new Date();
  return boloes.filter(bolao => {
    const closingTime = bolao.closingTime; 
    return bolao.status === 'Aberto' && closingTime && isValid(closingTime) && !isPast(closingTime);
  });
};

export const getBoloes = async (): Promise<Bolao[]> => {
  try {
    const [boloesSnapshot, allCategories] = await Promise.all([
      getDocs(collection(db, "boloes")),
      getAllCategories()
    ]);
    const boloes = boloesSnapshot.docs.map(doc => fromFirestore(doc, allCategories));
    const boloesWithTeams = await Promise.all(boloes.map(async (bolao) => ({
      ...bolao,
      homeTeam: await getTeamById(bolao.homeTeam.id) || bolao.homeTeam,
      awayTeam: await getTeamById(bolao.awayTeam.id) || bolao.awayTeam
    })));
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
    const [querySnapshot, allCategories] = await Promise.all([
        getDocs(q),
        getAllCategories()
    ]);
    const boloes = querySnapshot.docs.map(doc => fromFirestore(doc, allCategories));
    const boloesWithTeams = await Promise.all(boloes.map(async (bolao) => ({
      ...bolao,
      homeTeam: await getTeamById(bolao.homeTeam.id) || bolao.homeTeam,
      awayTeam: await getTeamById(bolao.awayTeam.id) || bolao.awayTeam
    })));
    return boloesWithTeams.filter(b => b.homeScore !== undefined && b.awayScore !== undefined);
  } catch (error) {
    console.error("Erro ao buscar bolões finalizados: ", error);
    throw new Error("Não foi possível buscar os resultados dos jogos.");
  }
};

export const getBoloesByCategoryId = async (categoryId: string): Promise<Bolao[]> => {
    try {
      const q = query(collection(db, "boloes"), where("categoryIds", "array-contains", categoryId));
      const [querySnapshot, allCategories] = await Promise.all([
          getDocs(q),
          getAllCategories()
      ]);
      const boloes = querySnapshot.docs.map(doc => fromFirestore(doc, allCategories));
      const boloesWithTeams = await Promise.all(boloes.map(async (bolao) => ({
        ...bolao,
        homeTeam: await getTeamById(bolao.homeTeam.id) || bolao.homeTeam,
        awayTeam: await getTeamById(bolao.awayTeam.id) || bolao.awayTeam
      })));
      return filterAvailableBoloes(boloesWithTeams);
    } catch (error) {
      console.error("Erro ao buscar bolões por categoria: ", error);
      throw new Error("Não foi possível buscar os bolões para esta categoria.");
    }
};

export const getBolaoById = async (id: string): Promise<Bolao | null> => {
    if (!id) return null;
    try {
      const [docSnap, allCategories] = await Promise.all([
        getDoc(doc(db, 'boloes', id)),
        getAllCategories()
      ]);

      if (docSnap.exists()) {
        const bolao = fromFirestore(docSnap, allCategories);
        const [homeTeam, awayTeam] = await Promise.all([
          getTeamById(bolao.homeTeam.id),
          getTeamById(bolao.awayTeam.id)
        ]);
        return {
          ...bolao,
          homeTeam: homeTeam || bolao.homeTeam,
          awayTeam: awayTeam || bolao.awayTeam
        };
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
      homeTeam: { name: homeTeam.name, shieldUrl: homeTeam.shieldUrl },
      awayTeam: { name: awayTeam.name, shieldUrl: awayTeam.shieldUrl },
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
    if (homeTeam) {
        dataToUpdate.homeTeamId = homeTeam.id;
        dataToUpdate.homeTeam = { name: homeTeam.name, shieldUrl: homeTeam.shieldUrl };
    }
    if (awayTeam) {
        dataToUpdate.awayTeamId = awayTeam.id;
        dataToUpdate.awayTeam = { name: awayTeam.name, shieldUrl: awayTeam.shieldUrl };
    }
    await updateDoc(bolaoRef, dataToUpdate);
  } catch (error) {
    console.error("Erro ao atualizar bolão: ", error);
    throw new Error("Não foi possível atualizar o bolão.");
  }
};

export const deleteBolao = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "boloes", id));
    } catch (error)
      console.error("Erro ao deletar bolão: ", error);
      throw new Error("Não foi possível deletar o bolão.");
    }
};
