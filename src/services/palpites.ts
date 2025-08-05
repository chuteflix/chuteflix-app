
import { db } from "@/lib/firebase";
import {
  collection, query, where, getDocs, doc, getDoc, updateDoc,
  DocumentData, getCountFromServer, orderBy, writeBatch, deleteDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getBolaoById, Bolao } from "./boloes";
import { getTeamById, Team } from "./teams";
import { getUserProfile } from "./users";
import { User } from "@/types";

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
  user?: User;
  bolaoDetails?: Bolao & {
    teamADetails?: Team;
    teamBDetails?: Team;
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

export const placeChute = async (bolaoId: string, scoreTeam1: number, scoreTeam2: number, betAmount: number, comment?: string): Promise<any> => {
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
            body: JSON.stringify({ bolaoId, scoreTeam1, scoreTeam2, betAmount, comment }),
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
      const palpiteRef = doc(db, "chutes", id);
      await updateDoc(palpiteRef, { status });
    }
  } catch (error) {
    console.error(`Erro ao atualizar status do palpite para ${status}:`, error);
    throw error;
  }
};

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

export const getPalpitesComDetalhes = async (userId: string): Promise<PalpiteComDetalhes[]> => {
    if (!userId) return [];
    
    const userPalpites = await getPalpitesByUser(userId);
    
    const palpitesComDetalhes = await Promise.all(
        userPalpites.map(async (palpite) => {
          const bolaoDetails = await getBolaoById(palpite.bolaoId);
          if (!bolaoDetails) return palpite;

          const [teamADetails, teamBDetails] = await Promise.all([
              getTeamById(bolaoDetails.homeTeam.id),
              getTeamById(bolaoDetails.awayTeam.id),
          ]);

          return {
            ...palpite,
            bolaoDetails: {
              ...bolaoDetails,
              teamADetails,
              teamBDetails,
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
