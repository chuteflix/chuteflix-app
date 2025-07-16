
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc, // 1. Importar a função updateDoc
  DocumentData,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getUserProfile, UserProfile } from "./users"

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
      createdAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating transaction: ", error)
    throw new Error("Failed to create transaction.")
  }
}

// 2. Criar a função updateTransaction
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

    // Opcional: buscar dados do usuário para cada transação
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
