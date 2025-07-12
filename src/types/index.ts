export interface Team {
  id: string;
  name: string;
  logoUrl: string;
}

export interface Championship {
  id: string;
  name: string;
  scope: 'Nacional' | 'Regional' | 'Estadual';
  location: string;
  level: 'Profissional' | 'Amador/Várzea';
}

export interface Bolao {
  id: string;
  championshipId: string;
  championship: string;
  teamA: Team;
  teamB: Team;
  matchDate: Date;
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
}

export interface Transaction {
  id: string;
  userId: string;
  bolaoId: string;
  amount: number;
  date: Date;
  status: 'Pendente' | 'Confirmado' | 'Falhou';
}
