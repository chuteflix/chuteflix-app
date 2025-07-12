import type { Bolao, Team, User, Transaction, Championship, Settings } from "@/types";

export const teams: Team[] = [
  { id: '1', name: 'Flamengo', logoUrl: 'https://placehold.co/64x64/FF0000/FFFFFF.png?text=FLA' },
  { id: '2', name: 'Palmeiras', logoUrl: 'https://placehold.co/64x64/008000/FFFFFF.png?text=PAL' },
  { id: '3', name: 'Corinthians', logoUrl: 'https://placehold.co/64x64/000000/FFFFFF.png?text=COR' },
  { id: '4', name: 'São Paulo', logoUrl: 'https://placehold.co/64x64/FF0000/FFFFFF.png?text=SAO' },
  { id: '5', name: 'Vasco da Gama', logoUrl: 'https://placehold.co/64x64/000000/FFFFFF.png?text=VAS' },
  { id: '6', name: 'Grêmio', logoUrl: 'https://placehold.co/64x64/0000FF/FFFFFF.png?text=GRE' },
];

export const championships: Championship[] = [
  { id: 'c1', name: 'Brasileirão Série A', scope: 'Nacional', location: 'Brasil', level: 'Profissional' },
  { id: 'c2', name: 'Copa do Brasil', scope: 'Nacional', location: 'Brasil', level: 'Profissional' },
  { id: 'c3', name: 'Libertadores', scope: 'Regional', location: 'América do Sul', level: 'Profissional' },
  { id: 'c4', name: 'Copa da Várzea SP', scope: 'Estadual', location: 'São Paulo', level: 'Amador/Várzea' },
];

export const boloes: Bolao[] = [
  {
    id: 'b1',
    championshipId: 'c1',
    championship: 'Brasileirão Série A',
    teamA: teams[0],
    teamB: teams[1],
    matchDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    betAmount: 20.00,
    status: 'Aberto',
  },
  {
    id: 'b2',
    championshipId: 'c2',
    championship: 'Copa do Brasil',
    teamA: teams[2],
    teamB: teams[3],
    matchDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    betAmount: 15.00,
    status: 'Aberto',
  },
  {
    id: 'b3',
    championshipId: 'c3',
    championship: 'Libertadores',
    teamA: teams[4],
    teamB: teams[5],
    matchDate: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    betAmount: 25.00,
    status: 'Fechado',
  },
  {
    id: 'b4',
    championshipId: 'c1',
    championship: 'Brasileirão Série A',
    teamA: teams[1],
    teamB: teams[3],
    matchDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
    betAmount: 20.00,
    status: 'Aberto',
  },
];

export const myGuesses: Bolao[] = [
  { ...boloes[0], userGuess: { teamA: 2, teamB: 1 } },
  { ...boloes[1], userGuess: { teamA: 0, teamB: 0 } },
];

export const history: (Bolao & { result: { teamA: number, teamB: number }, prize: number })[] = [
  {
    ...boloes[2],
    status: 'Finalizado',
    userGuess: { teamA: 1, teamB: 1 },
    result: { teamA: 2, teamB: 0 },
    prize: 0,
    matchDate: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'b5',
    championshipId: 'c1',
    championship: 'Brasileirão Série A',
    teamA: teams[0],
    teamB: teams[4],
    matchDate: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
    betAmount: 10.00,
    status: 'Finalizado',
    userGuess: { teamA: 3, teamB: 1 },
    result: { teamA: 3, teamB: 1 },
    prize: 150.75,
  }
];

export const users: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@chuteflix.com', createdAt: new Date() },
  { id: 'u2', name: 'João Silva', email: 'joao.silva@email.com', createdAt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000) },
  { id: 'u3', name: 'Maria Oliveira', email: 'maria.oliveira@email.com', createdAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) },
];

export const transactions: Transaction[] = [
    { id: 't1', userId: 'u2', bolaoId: 'b1', amount: 20.00, date: new Date(), status: 'Confirmado' },
    { id: 't2', userId: 'u3', bolaoId: 'b2', amount: 15.00, date: new Date(), status: 'Confirmado' },
    { id: 't3', userId: 'u2', bolaoId: 'b5', amount: 10.00, date: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), status: 'Confirmado' },
    { id: 't4', userId: 'u3', bolaoId: 'b1', amount: 20.00, date: new Date(), status: 'Pendente' },
];

export let settings: Settings = {
    pixKey: '000.000.000-00',
    qrCodeUrl: 'https://placehold.co/200x200.png',
    whatsappNumber: '+5511999999999'
};

// Mock function to update settings
export const updateSettings = (newSettings: Partial<Settings>) => {
  settings = { ...settings, ...newSettings };
  console.log('Updated settings:', settings);
  return settings;
};
