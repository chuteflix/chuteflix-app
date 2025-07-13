
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, DocumentData, getCountFromServer } from "firebase/firestore";
import { Bolao } from "./boloes";
import { Team } from "./teams";
import { Championship } from "./championships";

export interface Palpite {
  id: string;
  userId: string;
  bolaoId: string;
  scoreTeam1: number;
  scoreTeam2: number;
  createdAt: string;
  status: "Pendente" | "Aprovado" | "Recusado";
  receiptUrl?: string; 
}


export interface PalpiteComDetalhes extends Palpite {
    bolaoDetails?: Bolao & {
        team1Details?: Team;
        team2Details?: Team;
        championshipDetails?: Championship;
    };
}


const fromFirestore = (doc: DocumentData): Palpite => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    bolaoId: data.bolaoId,
    scoreTeam1: data.scoreTeam1,
    scoreTeam2: data.scoreTeam2,
    createdAt: data.createdAt,
    status: data.status,
    receiptUrl: data.receiptUrl,
  };
};

export const getPalpitesByStatus = async (status: string): Promise<Palpite[]> => {
  try {
    const q = query(collection(db, "palpites"), where("status", "==", status));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Erro ao buscar palpites por status:", error);
    throw error;
  }
};

export const updatePalpiteStatus = async (id: string, status: "Aprovado" | "Recusado"): Promise<void> => {
  try {
    const palpiteRef = doc(db, "palpites", id);
    await updateDoc(palpiteRef, { status });
  } catch (error) {
    console.error("Erro ao atualizar status do palpite:", error);
    throw error;
  }
};

export const getPalpitesByBolaoId = async (bolaoId: string): Promise<Palpite[]> => {
    if (!bolaoId) {
      console.warn("ID do bolão não fornecido para getPalpitesByBolaoId.");
      return [];
    }
    
    try {
      const q = query(
        collection(db, "palpites"), 
        where("bolaoId", "==", bolaoId)
      );
  
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return [];
      }
      
      return querySnapshot.docs.map(fromFirestore);
  
    } catch (error) {
      console.error("Erro ao buscar palpites do bolão:", error);
      throw new Error("Não foi possível carregar os palpites.");
    }
  };

export const getPalpitesByUser = async (userId: string): Promise<Palpite[]> => {
  if (!userId) {
    console.warn("ID do usuário não fornecido para getPalpitesByUser.");
    return [];
  }
  
  try {
    const q = query(
      collection(db, "palpites"), 
      where("userId", "==", userId),
      where("status", "==", "Aprovado")
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return [];
    }
    
    return querySnapshot.docs.map(fromFirestore);

  } catch (error) {
    console.error("Erro ao buscar palpites do usuário:", error);
    throw new Error("Não foi possível carregar seus palpites.");
  }
};

export const getParticipantCount = async (bolaoId: string): Promise<number> => {
    if (!bolaoId) return 0;
    try {
        const q = query(
            collection(db, "palpites"),
            where("bolaoId", "==", bolaoId),
            where("status", "==", "Aprovado")
        );
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Erro ao contar participantes:", error);
        return 0;
    }
};
