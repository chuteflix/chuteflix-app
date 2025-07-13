
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

// --- Tipos e Interfaces ---

export type TransactionType =
  | "bet_placement"
  | "prize_winning"
  | "deposit"
  | "withdrawal"
  | "bonus"
  | "fee"
  | "refund"

export interface Transaction {
  uid: string // ID do usuário associado
  type: TransactionType
  amount: number // Positivo para entradas (prêmio), negativo para saídas (aposta)
  description: string
  status: "completed" | "pending" | "failed"
  createdAt: Timestamp
  metadata?: Record<string, any> // Dados adicionais específicos do tipo de transação
}

// --- Funções do Serviço ---

/**
 * Cria uma nova transação no Firestore.
 * @param transactionData - Os dados da transação a ser criada.
 * @returns O ID da transação criada.
 */
export const createTransaction = async (
  transactionData: Omit<Transaction, "createdAt">
): Promise<string> => {
  try {
    const transactionWithTimestamp = {
      ...transactionData,
      createdAt: Timestamp.now(),
    }
    const docRef = await addDoc(
      collection(db, "transactions"),
      transactionWithTimestamp
    )
    return docRef.id
  } catch (error) {
    console.error("Error creating transaction:", error)
    throw new Error("Failed to create transaction.")
  }
}

/**
 * Busca o histórico de transações de um usuário.
 * @param uid - O ID do usuário.
 * @returns Uma lista de transações do usuário.
 */
export const getUserTransactions = async (
  uid: string
): Promise<Transaction[]> => {
  try {
    const transactionsRef = collection(db, "transactions")
    const q = query(
      transactionsRef,
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    )
    const querySnapshot = await getDocs(q)
    const transactions: Transaction[] = []
    querySnapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() } as Transaction)
    })
    return transactions
  } catch (error) {
    console.error("Error getting user transactions:", error)
    return []
  }
}
