
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  DocumentData,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export type TransactionType =
  | "bet_placement"
  | "prize_winning"
  | "deposit"
  | "withdrawal"
  | "bonus"
  | "fee"
  | "refund"

export interface Transaction {
  id: string; 
  uid: string 
  type: TransactionType
  amount: number
  description: string
  status: "completed" | "pending" | "failed"
  createdAt: Timestamp
  metadata?: Record<string, any> 
}

const fromFirestore = (doc: DocumentData): Transaction => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data
    } as Transaction;
}

export const createTransaction = async (
  transactionData: Omit<Transaction, "id" | "createdAt">
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
    return querySnapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Error getting user transactions:", error)
    return []
  }
}

export const getAllTransactions = async (): Promise<Transaction[]> => {
    try {
      const transactionsRef = collection(db, "transactions");
      const q = query(transactionsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(fromFirestore);
    } catch (error) {
      console.error("Error getting all transactions:", error);
      return [];
    }
  };
  
export const updateTransactionStatusByPalpiteId = async (palpiteId: string, status: "completed" | "failed"): Promise<void> => {
    try {
        const q = query(collection(db, "transactions"), where("metadata.palpiteId", "==", palpiteId));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.warn(`Nenhuma transação encontrada para o palpiteId: ${palpiteId}`);
            return;
        }

        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
            batch.update(doc.ref, { status: status });
        });

        await batch.commit();

    } catch (error) {
        console.error("Erro ao atualizar status da transação por palpiteId:", error);
        throw new Error("Falha ao atualizar o status da transação.");
    }
};
