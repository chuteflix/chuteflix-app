
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  DocumentData,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase" // Removido 'functions' que não será mais usado aqui
import { getUserProfile, UserProfile } from "./users"
import { getAuth } from "firebase/auth"

export type TransactionStatus = "pending" | "completed" | "failed"
export type TransactionType = "deposit" | "withdrawal" | "bet_placement" | "prize_winning"

export interface Transaction {
  id: string
  uid: string
  type: TransactionType
  amount: number
  description: string
  status: TransactionStatus
  createdAt: any
  metadata?: {
    [key: string]: any
  }
  user?: UserProfile
}

const fromFirestore = (doc: DocumentData): Transaction => {
  const data = doc.data()
  return {
    id: doc.id,
    uid: data.uid,
    type: data.type,
    amount: data.amount,
    description: data.description,
    status: data.status,
    createdAt: data.createdAt,
    metadata: data.metadata,
  }
}

export const createTransaction = async (
  data: Omit<Transaction, "id" | "createdAt" | "user">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "transactions"), {
      ...data,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating transaction: ", error)
    throw new Error("Failed to create transaction.")
  }
}

export const updateTransaction = async (
  id: string,
  data: Partial<Omit<Transaction, "id" | "user">>
): Promise<void> => {
  try {
    const transactionDocRef = doc(db, "transactions", id)
    await updateDoc(transactionDocRef, data)
  } catch (error) {
    console.error("Error updating transaction:", error)
    throw new Error("Failed to update transaction.")
  }
}

/**
 * Solicita um saque chamando a nova API Route no Vercel.
 * @param {object} data - Contém o valor (amount) e a chave PIX (pixKey).
 * @returns O resultado da chamada da API.
 */
export const requestWithdrawal = async ({ amount, pixKey }: { amount: number; pixKey: string; }) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("Usuário não autenticado.");
    }

    try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/withdrawals/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ amount, pixKey }),
        });

        const result = await response.json();

        if (!response.ok) {
            // Lança um erro com a mensagem retornada pela API para ser capturado no formulário
            throw new Error(result.message || "Falha ao solicitar o saque.");
        }
        
        return result;

    } catch (error) {
        console.error("Erro ao solicitar saque:", error);
        // Re-lança o erro para que o componente que chamou a função possa tratá-lo
        throw error;
    }
};

export const getTransactions = async (
  filters: Partial<{ uid: string; type: TransactionType; status: TransactionStatus }>
): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, "transactions"),
      ...Object.entries(filters).map(([key, value]) => where(key, "==", value)),
      orderBy("createdAt", "desc")
    )

    const querySnapshot = await getDocs(q)
    const transactions = querySnapshot.docs.map(fromFirestore)

    const transactionsWithUsers = await Promise.all(
      transactions.map(async transaction => {
        const user = await getUserProfile(transaction.uid)
        return { ...transaction, user }
      })
    )

    return transactionsWithUsers
  } catch (error) {
    console.error("Error getting transactions:", error)
    throw new Error("Failed to get transactions.")
  }
}
