
export interface Team {
  id: string;
  name: string;
  shieldUrl?: string; 
  level: 'Profissional' | 'Amador/Várzea';
  location: string;
  scope: 'Nacional' | 'Estadual' | 'Municipal';
  state?: string;
  city?: string;
}

export interface Bolao {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  matchStartDate: Date | null; 
  matchEndDate: Date | null;   
  closingTime: Date | null;    
  betAmount: number;
  initialPrize?: number;
  status: 'Aberto' | 'Fechado' | 'Finalizado';
  categoryIds?: string[];
  categoryNames?: string[];
  userGuess?: {
    homeTeam: number;
    awayTeam: number;
  };
  finalScoreTeam1?: number; 
  finalScoreTeam2?: number; 
  // Adicionado para filtragem na prateleira
  type?: 'national' | 'international';
  championship?: string;
  homeScore?: number;
  awayScore?: number;
}

export interface UserProfile {
    uid: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    photoURL?: string;
    balance: number;
    isAdmin?: boolean;
    createdAt?: any;
    phone?: string;
    cpf?: string;
    pixKey?: string;
    pixKeyType?: string;
    role?: 'admin' | 'editor' | 'support' | 'user';
}
  
export type TransactionType = "deposit" | "withdrawal" | "bet_placement" | "prize_winning" | "bet_refund";

export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
  id: string;
  uid: string; // userId para manter consistência
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  createdAt: any; // Firestore Timestamp
  processedAt?: any; // Firestore Timestamp
  processedBy?: string; // UID do admin que processou
  metadata?: {
    [key: string]: any;
  };
}

export interface Settings {
  appName: string;
  logoUrl?: string;
  faviconUrl?: string;
  metaDescription?: string;
  metaKeywords?: string;
  pixKey?: string;
  qrCodeUrl?: string;
  whatsappNumber?: string;
  minDeposit?: number;
  minWithdrawal?: number;
  homeHeroSubtitle?: string;
  colors?: {
    primary?: string | null;
    secondary?: string | null;
    accent?: string | null;
    background?: string | null;
    text?: string | null;
  } | null;
}
