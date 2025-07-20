export interface Team {
  id: string;
  name: string;
  logoUrl: string;
  level: 'Profissional' | 'Amador/Várzea';
  location: string;
  scope: 'Nacional' | 'Estadual' | 'Municipal';
}

export interface Championship {
  id: string;
  name: string;
  type: 'professional' | 'amateur';
  competitionType: 'national' | 'international';
  scope?: 'national' | 'state' | 'municipal';
  series?: 'A' | 'B' | 'C' | 'D';
  state?: string;
  city?: string;
  continent?: string;
  country?: string;
}

export interface Bolao {
  id: string;
  championshipId: string;
  championship: string;
  homeTeam: Team;
  awayTeam: Team;
  matchStartDate: Date | null; // Pode ser Date ou null
  matchEndDate: Date | null;   // Pode ser Date ou null
  closingTime: Date | null;    // Pode ser Date ou null
  betAmount: number;
  initialPrize?: number;
  status: 'Aberto' | 'Fechado' | 'Finalizado';
  categoryIds?: string[];
  userGuess?: {
    homeTeam: number;
    awayTeam: number;
  };
  finalScoreTeam1?: number; 
  finalScoreTeam2?: number; 
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
}
  

export interface Transaction {
  id: string;
  userId: string;
  bolaoId: string;
  amount: number;
  date: Date;
  status: 'Pendente' | 'Confirmado' | 'Falhou';
}

export interface Settings {
  pixKey: string;
  qrCodeUrl: string;
  whatsappNumber: string;
  minDeposit: number;
  minWithdrawal: number;
}
