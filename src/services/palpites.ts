
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, DocumentData } from "firebase/firestore";
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
}

// Interface estendida para incluir detalhes
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
  };
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
      where("status", "==", "Aprovado") // Apenas palpites com pagamento aprovado
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
