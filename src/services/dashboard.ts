
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  getCountFromServer,
  DocumentData,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Transaction, User } from "@/types";
import { getUserProfile } from "./users"; 

export interface DashboardKPIs {
  totalRevenue: number;
  totalWithdrawals: number;
  netBalance: number;
  totalBetsCount: number;
  averageBetValue: number;
  totalUsersCount: number;
  newUsersLast30Days: number;
  totalPrizesPaid: number;
}

export interface RecentTransaction extends Transaction {
  user?: User;
}

const getSumFromTransactions = async (
  type: Transaction["type"],
  status: Transaction["status"] = "completed"
): Promise<number> => {
  const q = query(
    collection(db, "transactions"),
    where("type", "==", type),
    where("status", "==", status)
  );
  const querySnapshot = await getDocs(q);
  let total = 0;
  querySnapshot.forEach((doc) => {
    const amount = doc.data().amount;
    if (typeof amount === 'number') {
        total += Math.abs(amount);
    }
  });
  return total;
};

const getCountFromCollection = async (
  collectionName: string,
  dateField?: string,
  days?: number
): Promise<number> => {
  let q;
  if (dateField && days) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    q = query(
      collection(db, collectionName),
      where(dateField, ">=", Timestamp.fromDate(threshold))
    );
  } else {
    q = query(collection(db, collectionName));
  }
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

export const getDashboardData = async (): Promise<{
  kpis: DashboardKPIs;
  recentUsers: User[];
  recentTransactions: RecentTransaction[];
}> => {
  try {
    const [
      totalRevenue,
      totalWithdrawals,
      totalBetsCount,
      totalUsersCount,
      newUsersLast30Days,
      totalPrizesPaid,
      totalBetAmount,
    ] = await Promise.all([
      getSumFromTransactions("deposit"),
      getSumFromTransactions("withdrawal"),
      getCountFromCollection("chutes"),
      getCountFromCollection("users"),
      getCountFromCollection("users", "createdAt", 30),
      getSumFromTransactions("prize_winning"),
      getSumFromTransactions("bet_placement")
    ]);

    const kpis: DashboardKPIs = {
      totalRevenue,
      totalWithdrawals,
      netBalance: totalRevenue - totalWithdrawals,
      totalBetsCount,
      averageBetValue: totalBetsCount > 0 ? totalBetAmount / totalBetsCount : 0,
      totalUsersCount,
      newUsersLast30Days,
      totalPrizesPaid
    };

    const usersQuery = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const transactionsQuery = query(
      collection(db, "transactions"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const [usersSnapshot, transactionsSnapshot] = await Promise.all([
      getDocs(usersQuery),
      getDocs(transactionsQuery),
    ]);

    const recentUsers: User[] = (await Promise.all(usersSnapshot.docs.map(doc => getUserProfile(doc.id)))).filter(Boolean) as User[];

    const recentTransactions: RecentTransaction[] = await Promise.all(
      transactionsSnapshot.docs.map(async (doc) => {
        const transData = doc.data() as Transaction;
        const user = await getUserProfile(transData.uid);
        return {
          id: doc.id,
          ...transData,
          user: user || undefined
        };
      })
    );

    return { kpis, recentUsers, recentTransactions };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      kpis: {
        totalRevenue: 0,
        totalWithdrawals: 0,
        netBalance: 0,
        totalBetsCount: 0,
        averageBetValue: 0,
        totalUsersCount: 0,
        newUsersLast30Days: 0,
        totalPrizesPaid: 0
      },
      recentUsers: [],
      recentTransactions: [],
    };
  }
};
