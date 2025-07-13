
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, DocumentData,getCountFromServer } from "firebase/firestore";
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

// Nova função para contar participantes de um bolão (apenas com status "Aprovado")
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
        // Retorna 0 em caso de erro para não quebrar a UI
        return 0;
    }
};
