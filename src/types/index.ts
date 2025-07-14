export interface Team {
  id: string;
  name: string;
  logoUrl: string;
  level: 'Profissional' | 'Amador/Várzea';
  location: string; // Estado/Cidade
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
  teamA: Team;
  teamB: Team;
  matchStartDate: Date;
  matchEndDate: Date;
  betAmount: number;
  status: 'Aberto' | 'Fechado' | 'Finalizado';
  userGuess?: {
    teamA: number;
    teamB: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  balance: number;
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
}
