export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  balance?: number;
  role?: "admin" | "user";
  cpf?: string;
  phone?: string;
}

export interface Bolao {
  id: string;
  name: string;
  description: string;
  category: string;
  championship: string;
  options: Record<string, number>;
  result?: string;
  status: "open" | "closed" | "finished";
  createdAt: any;
  updatedAt: any;
  maxParticipants?: number;
  minParticipants?: number;
  value: number;
  createdBy: string;
  ganhadores?: Ganhador[];
}

export interface Palpite {
  id: string;
  userId: string;
  bolaoId: string;
  option: string;
  createdAt: any;
  updatedAt: any;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal" | "bet" | "prize";
  amount: number;
  status: "pending" | "approved" | "declined";
  createdAt: any;
  updatedAt: any;
  transactionId?: string;
  proofOfPayment?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Championship {
  id: string;
  name: string;
  country: string;
}

export interface Team {
  id: string;
  name: string;
  championship: string;
  country: string;
}

export interface Ganhador {
  userId: string;
  option: string;
  premio: number;
}
