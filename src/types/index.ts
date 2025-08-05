export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  balance?: number;
  role?: "admin" | "user";
  cpf?: string;
  phone?: string;
  pixKey?: string;
  pixKeyType?: string;
}

export interface Bolao {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  matchStartDate: Date | null;
  matchEndDate?: Date | null;
  closingTime: Date | null;
  betAmount: number;
  initialPrize?: number;
  status: "Aberto" | "Fechado" | "Finalizado";
  finalScoreTeam1?: number;
  finalScoreTeam2?: number;
  categoryIds: string[];
  categoryNames?: string[];
  championship: string;
  // Client-side specific
  userGuess?: { teamA: number, teamB: number };
  homeScore?: number;
  awayScore?: number;
}


export interface Palpite {
  id: string;
  userId: string;
  bolaoId: string;
  scoreTeam1: number;
  scoreTeam2: number;
  amount: number;
  createdAt: any;
  status: "Em Aberto" | "Ganho" | "Perdido" | "Anulado";
  comment?: string;
}

export interface Transaction {
  id: string;
  uid: string;
  type: "deposit" | "withdrawal" | "bet_placement" | "prize_winning" | "bet_refund";
  amount: number;
  description: string;
  status: "pending" | "completed" | "failed";
  createdAt: any;
  processedAt?: any;
  processedBy?: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  order: number;
  parentId?: string | null;
  children?: Category[];
  boloes?: Bolao[];
}


export interface Championship {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  shieldUrl?: string;
  state?: string;
  city?: string;
  // Campos legados ou de diferentes fontes
  level?: string;
  scope?: string;
  location?: string;
  championshipId?: string;
}

export interface Ganhador {
  userId: string;
  option: string;
  premio: number;
}

export interface Settings {
  appName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  metaDescription?: string;
  metaKeywords?: string;
  homeHeroSubtitle?: string;
  pixKey?: string;
  qrCodeUrl?: string;
  whatsappNumber?: string;
  minDeposit?: number;
  minWithdrawal?: number;
  colors?: {
    primary?: string | null;
    secondary?: string | null;
    accent?: string | null;
    background?: string | null;
    text?: string | null;
  } | null; // Added | null here
}
