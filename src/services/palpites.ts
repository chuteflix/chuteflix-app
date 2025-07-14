
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, DocumentData, getCountFromServer, orderBy, limit } from "firebase/firestore";
import { getBolaoById, Bolao } from "./boloes";
import { getTeamById, Team } from "./teams";
import { getChampionshipById, Championship } from "./championships";
import { getUserProfile, UserProfile } from "./users";

export interface Palpite {
  id: string;
  userId: string;
  bolaoId: string;
  scoreTeam1: number;
  scoreTeam2: number;
  createdAt: any;
  status: "Pendente" | "Aprovado" | "Recusado";
  receiptUrl?: string; 
  comment?: string;
}

export interface PalpiteComDetalhes extends Palpite {
    user?: UserProfile;
    bolaoDetails?: Bolao & {
        teamADetails?: Team;
        teamBDetails?: Team;
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
    comment: data.comment,
  };
};

export const getPalpitesComDetalhes = async (userId: string): Promise<PalpiteComDetalhes[]> => {
    if (!userId) return [];
    
    const userPalpites = await getPalpitesByUser(userId);
    
    const palpitesComDetalhes = await Promise.all(
        userPalpites.map(async (palpite) => {
          const bolaoDetails = await getBolaoById(palpite.bolaoId);
          if (!bolaoDetails) return palpite;

          const [teamADetails, teamBDetails, championshipDetails] = await Promise.all([
              getTeamById(bolaoDetails.teamAId),
              getTeamById(bolaoDetails.teamBId),
              getChampionshipById(bolaoDetails.championshipId),
          ]);

          return {
            ...palpite,
            bolaoDetails: {
              ...bolaoDetails,
              teamADetails,
              teamBDetails,
              championshipDetails,
            },
          }
        })
    );

    return palpitesComDetalhes;
}

export const getLatestPalpitesWithUserData = async (bolaoId: string): Promise<PalpiteComDetalhes[]> => {
    if (!bolaoId) return [];
    try {
        const q = query(
            collection(db, "palpites"),
            where("bolaoId", "==", bolaoId),
            where("status", "==", "Aprovado"),
            orderBy("createdAt", "desc"),
            limit(10)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return [];

        const palpites = querySnapshot.docs.map(fromFirestore);

        const palpitesComUsuarios = await Promise.all(
            palpites.map(async (palpite) => {
                const user = await getUserProfile(palpite.userId);
                return { ...palpite, user };
            })
        );

        return palpitesComUsuarios;
    } catch (error) {
        console.error("Erro ao buscar últimos palpites com dados de usuário:", error);
        return [];
    }
}

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

export const getPalpitesByBolaoId = async (bolaoId: string, status?: Palpite['status']): Promise<Palpite[]> => {
    if (!bolaoId) {
      console.warn("ID do bolão não fornecido para getPalpitesByBolaoId.");
      return [];
    }
    
    try {
      let q;
      if (status) {
          q = query(
              collection(db, "palpites"), 
              where("bolaoId", "==", bolaoId),
              where("status", "==", status)
          );
      } else {
          q = query(
              collection(db, "palpites"), 
              where("bolaoId", "==", bolaoId)
          );
      }
  
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
      orderBy("createdAt", "desc")
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
