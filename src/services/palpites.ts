
import { db, functions } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, DocumentData, getCountFromServer, orderBy, limit, writeBatch, deleteDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getBolaoById, Bolao } from "./boloes";
import { getTeamById, Team } from "./teams";
import { getChampionshipById, Championship } from "./championships";
import { getUserProfile, UserProfile } from "./users";

// Tipagem de Status Atualizada, incluindo o status legado "Aprovado" para leitura
export type PalpiteStatus = "Em Aberto" | "Ganho" | "Perdido" | "Anulado" | "Aprovado";

export interface Palpite {
  id: string;
  userId: string;
  bolaoId: string;
  scoreTeam1: number;
  scoreTeam2: number;
  amount: number;
  createdAt: any;
  status: PalpiteStatus;
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
    amount: data.amount || 0, // Garante que amount sempre exista
    createdAt: data.createdAt,
    status: data.status,
    comment: data.comment,
  };
};

export const placeChute = async (bolaoId: string, scoreTeam1: number, scoreTeam2: number, amount: number): Promise<void> => {
    try {
        const placeChuteFunction = httpsCallable(functions, 'placeChute');
        await placeChuteFunction({ bolaoId, scoreTeam1, scoreTeam2, amount });
    } catch (error) {
        console.error("Erro ao registrar o chute:", error);
        throw error;
    }
};

export const deletePalpite = async (id: string): Promise<void> => {
  const palpiteRef = doc(db, "chutes", id);
  await deleteDoc(palpiteRef);
};

// Função de busca por status corrigida
export const getPalpitesByStatus = async (status: PalpiteStatus): Promise<Palpite[]> => {
  try {
    const collectionName = "chutes"; // Usando a coleção correta
    let statusQuery;

    // Lógica de retrocompatibilidade
    if (status === "Em Aberto") {
      statusQuery = where("status", "in", ["Em Aberto", "Aprovado"]);
    } else {
      statusQuery = where("status", "==", status);
    }
    
    const q = query(collection(db, collectionName), statusQuery, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Erro ao buscar palpites por status:", error);
    throw new Error("Não foi possível buscar os palpites.");
  }
};

// Função de atualização de status corrigida
export const updatePalpiteStatus = async (id: string, status: PalpiteStatus): Promise<void> => {
  const palpiteRef = doc(db, "chutes", id); // Usando a coleção correta
  try {
    if (status === "Anulado") {
      const anularChuteFunction = httpsCallable(functions, 'anularChute');
      await anularChuteFunction({ palpiteId: id });
    } else {
      await updateDoc(palpiteRef, { status });
    }
  } catch (error) {
    console.error(`Erro ao atualizar status do palpite para ${status}:`, error);
    throw error;
  }
};

// Função de resultado corrigida
export const setResultAndProcessPalpites = async (bolaoId: string, scoreTeam1: number, scoreTeam2: number) => {
    const batch = writeBatch(db);
    const collectionName = "chutes"; // Usando a coleção correta

    const bolaoRef = doc(db, 'boloes', bolaoId);
    batch.update(bolaoRef, { finalScoreTeam1: scoreTeam1, finalScoreTeam2: scoreTeam2, status: 'Finalizado' });

    const palpitesQuery = query(collection(db, collectionName), where('bolaoId', '==', bolaoId), where('status', 'in', ['Em Aberto', 'Aprovado']));
    const palpitesSnapshot = await getDocs(palpitesQuery);

    const winners: Palpite[] = [];
    let totalBetAmount = 0;

    palpitesSnapshot.forEach(palpiteDoc => {
        const palpite = fromFirestore(palpiteDoc);
        totalBetAmount += palpite.amount;
        if (palpite.scoreTeam1 === scoreTeam1 && palpite.scoreTeam2 === scoreTeam2) {
            winners.push(palpite);
        } else {
            batch.update(palpiteDoc.ref, { status: 'Perdido' });
        }
    });

    if (winners.length > 0) {
        const bolaoDoc = await getDoc(bolaoRef);
        const bolaoData = bolaoDoc.data() as Bolao;
        const totalPrize = (bolaoData.initialPrize || 0) + (totalBetAmount * 0.9);
        const prizePerWinner = totalPrize / winners.length;

        const payWinnerFunction = httpsCallable(functions, 'payWinner');
        const winnerPromises = winners.map(winner => {
            batch.update(doc(db, collectionName, winner.id), { status: 'Ganho' });
            return payWinnerFunction({ userId: winner.userId, bolaoId: bolaoId, prizeAmount: prizePerWinner });
        });
        
        await Promise.all(winnerPromises);
    }
    
    await batch.commit();
};


// Demais funções corrigidas para usar a coleção "chutes" e com a lógica restaurada
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

export const getPalpitesByBolaoId = async (bolaoId: string): Promise<PalpiteComDetalhes[]> => {
    if (!bolaoId) return [];
    try {
        const q = query(
            collection(db, "chutes"), // Corrigido
            where("bolaoId", "==", bolaoId),
            orderBy("createdAt", "desc")
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


export const getPalpitesByUser = async (userId: string): Promise<Palpite[]> => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, "chutes"), 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
  } catch (error) {
    throw new Error("Não foi possível carregar seus palpites.");
  }
};

export const getParticipantCount = async (bolaoId: string): Promise<number> => {
    if (!bolaoId) return 0;
    try {
        const q = query(
            collection(db, "chutes"),
            where("bolaoId", "==", bolaoId),
            where("status", "in", ["Em Aberto", "Ganho", "Perdido", "Aprovado"])
        );
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Erro ao contar participantes:", error);
        return 0;
    }
};
