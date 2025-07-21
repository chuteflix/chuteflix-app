
import { db } from "@/lib/firebase"; // Removido 'functions'
import {
  collection, query, where, getDocs, doc, getDoc, updateDoc,
  DocumentData, getCountFromServer, orderBy, writeBatch, deleteDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Importado para obter o usuário atual
import { getBolaoById, Bolao } from "./boloes";
import { getTeamById, Team } from "./teams";
import { getChampionshipById, Championship } from "./championships";
import { getUserProfile, UserProfile } from "./users";

export type PalpiteStatus = "Em Aberto" | "Ganho" | "Perdido" | "Anulado";

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
    amount: data.amount || 0,
    createdAt: data.createdAt,
    status: data.status,
    comment: data.comment,
  };
};

/**
 * Realiza um chute (aposta) chamando a nova API Route no Vercel.
 * @param {string} bolaoId - O ID do bolão.
 * @param {number} scoreTeam1 - O placar do time 1.
 * @param {number} scoreTeam2 - O placar do time 2.
 * @param {string} [comment] - Um comentário opcional para a aposta.
 * @returns O resultado da chamada da API.
 */
export const placeChute = async (bolaoId: string, scoreTeam1: number, scoreTeam2: number, comment?: string): Promise<any> => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("Usuário não autenticado.");
    }

    try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/chutes/place', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ bolaoId, scoreTeam1, scoreTeam2, comment }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Falha ao registrar o chute.");
        }

        return result;

    } catch (error) {
        console.error("Erro ao registrar o chute:", error);
        throw error;
    }
};

export const deletePalpite = async (id: string): Promise<void> => {
  const palpiteRef = doc(db, "chutes", id);
  await deleteDoc(palpiteRef);
};

export const getPalpitesByStatus = async (status: PalpiteStatus): Promise<Palpite[]> => {
  try {
    const q = query(collection(db, "chutes"), where("status", "==", status), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Erro ao buscar palpites por status:", error);
    throw new Error("Não foi possível buscar os palpites.");
  }
};

/**
 * Atualiza o status de um palpite. Se o status for 'Anulado', chama a API de anulação.
 * @param {string} id - O ID do palpite.
 * @param {PalpiteStatus} status - O novo status do palpite.
 */
export const updatePalpiteStatus = async (id: string, status: PalpiteStatus): Promise<void> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
      throw new Error("Usuário não autenticado.");
  }

  try {
    const idToken = await user.getIdToken();

    if (status === "Anulado") {
      const response = await fetch('/api/chutes/annul', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ palpiteId: id }),
      });

      const result = await response.json();

      if (!response.ok) {
          throw new Error(result.message || "Falha ao anular o chute.");
      }
      console.log("Chute anulado com sucesso:", result);
    } else {
      // Para outros status que não envolvem estorno de saldo (e.g., Ganho, Perdido)
      const palpiteRef = doc(db, "chutes", id);
      await updateDoc(palpiteRef, { status });
    }
  } catch (error) {
    console.error(`Erro ao atualizar status do palpite para ${status}:`, error);
    throw error;
  }
};

/**
 * Define o resultado de um bolão e processa os palpites, incluindo o pagamento aos vencedores.
 * Esta função agora chama uma API Route no backend para a lógica transacional.
 * @param {string} bolaoId - O ID do bolão a ser finalizado.
 * @param {number} scoreTeam1 - O placar final do Time 1.
 * @param {number} scoreTeam2 - O placar final do Time 2.
 * @returns O resultado da operação do backend.
 */
export const setResultAndProcessPalpites = async (bolaoId: string, scoreTeam1: number, scoreTeam2: number) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("Usuário não autenticado.");
    }

    try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/boloes/process-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ bolaoId, scoreTeam1, scoreTeam2 }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Falha ao processar os resultados do bolão.");
        }

        return result;

    } catch (error) {
        console.error("Erro ao definir resultado e processar palpites:", error);
        throw error;
    }
};

// --- Funções de leitura (geralmente não precisam de grandes alterações) ---

export const getPalpitesComDetalhes = async (userId: string): Promise<PalpiteComDetalhes[]> => {
    if (!userId) return [];
    
    const userPalpites = await getPalpitesByUser(userId);
    
    const palpitesComDetalhes = await Promise.all(
        userPalpites.map(async (palpite) => {
          const bolaoDetails = await getBolaoById(palpite.bolaoId);
          if (!bolaoDetails) return palpite;

          const [teamADetails, teamBDetails, championshipDetails] = await Promise.all([
              getTeamById(bolaoDetails.homeTeam.id),
              getTeamById(bolaoDetails.awayTeam.id),
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
            collection(db, "chutes"),
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
            where("status", "in", ["Em Aberto", "Ganho", "Perdido"])
        );
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Erro ao contar participantes:", error);
        return 0;
    }
};
