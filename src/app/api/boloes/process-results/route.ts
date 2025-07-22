
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Função para inicializar o Firebase Admin SDK de forma segura
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FB_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FB_ADMIN_CLIENT_EMAIL;
    // A chave privada vem como uma string com '\\n' no lugar de quebras de linha.
    const privateKey = process.env.FB_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.error("Firebase Admin SDK - Variáveis de ambiente do servidor ausentes ou vazias.");
      throw new Error("Configuração do servidor Firebase incompleta.");
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("Firebase Admin SDK inicializado com sucesso.");
    } catch (error) {
      console.error("Firebase Admin SDK - ERRO FATAL ao inicializar:", error);
      throw error;
    }
  }
}

const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'transactions';
const BOLOES_COLLECTION = 'boloes';
const CHUTES_COLLECTION = 'chutes';

export async function POST(req: Request) {
  console.log("Iniciando POST para /api/boloes/process-results");
  try {
    initializeFirebaseAdmin();
    const db = admin.firestore();
    console.log("Firebase Admin SDK e Firestore inicializados.");

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("Requisição não autenticada: cabeçalho de autorização ausente ou inválido.");
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    console.log("Token de autenticação recebido.");

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("Token de autenticação verificado para usuário:", decodedToken.uid);
    } catch (error) {
      console.error("Erro ao verificar token de autenticação:", error);
      return NextResponse.json({ message: 'Token inválido ou expirado.' }, { status: 401 });
    }

    const isAdmin = decodedToken.role === 'admin';
    if (!isAdmin) {
      console.log("Acesso negado: usuário não é administrador.");
      return NextResponse.json({ message: 'Apenas administradores podem processar resultados de bolões.' }, { status: 403 });
    }

    const { bolaoId, scoreTeam1, scoreTeam2 } = await req.json();
    console.log(`Dados recebidos - Bolão ID: ${bolaoId}, Score Time 1: ${scoreTeam1}, Score Time 2: ${scoreTeam2}`);

    if (!bolaoId || typeof scoreTeam1 !== 'number' || typeof scoreTeam2 !== 'number') {
      console.log("Dados do resultado do bolão inválidos ou ausentes.");
      return NextResponse.json({ message: 'Dados do resultado do bolão inválidos ou ausentes.' }, { status: 400 });
    }

    const result = await db.runTransaction(async (transaction) => {
      console.log(`Iniciando transação para o bolão: ${bolaoId}`);
      
      // 1. TODAS AS LEITURAS PRIMEIRO
      const bolaoRef = db.collection(BOLOES_COLLECTION).doc(bolaoId);
      const bolaoDoc = await transaction.get(bolaoRef);

      if (!bolaoDoc.exists) {
        console.error(`Erro: Bolão ${bolaoId} não encontrado.`);
        throw new Error('Bolão não encontrado.');
      }
      
      const palpitesQuery = db.collection(CHUTES_COLLECTION)
        .where('bolaoId', '==', bolaoId)
        .where('status', '==', 'Em Aberto');
      const palpitesSnapshot = await transaction.get(palpitesQuery);
      
      console.log(`Leituras concluídas. Bolão encontrado. ${palpitesSnapshot.size} palpites encontrados.`);

      // 2. VERIFICAÇÕES E LÓGICA (SEM ACESSO AO BANCO)
      const bolaoData = bolaoDoc.data();
      if (bolaoData?.status === 'Finalizado') {
        console.error(`Erro: Bolão ${bolaoId} já foi finalizado.`);
        throw new Error('Este bolão já foi finalizado.');
      }

      // 3. TODAS AS ESCRITAS DEPOIS
      console.log(`Atualizando status do bolão ${bolaoId} para Finalizado.`);
      transaction.update(bolaoRef, {
        finalScoreTeam1: scoreTeam1,
        finalScoreTeam2: scoreTeam2,
        status: 'Finalizado',
      });

      const winners: { userId: string; amount: number; palpiteId: string; }[] = [];
      let totalBetAmount = 0;
      let prizePerWinner = 0;

      if (palpitesSnapshot.empty) {
        console.warn(`Nenhum palpite elegível para o bolão ${bolaoId}.`);
        return { message: "Bolão finalizado, mas nenhum palpite elegível para processamento." };
      }

      palpitesSnapshot.forEach(palpiteDoc => {
        const palpiteData = palpiteDoc.data();
        totalBetAmount += palpiteData.amount;

        if (palpiteData.scoreTeam1 === scoreTeam1 && palpiteData.scoreTeam2 === scoreTeam2) {
          transaction.update(palpiteDoc.ref, { status: 'Ganho' });
          winners.push({ userId: palpiteData.userId, amount: palpiteData.amount, palpiteId: palpiteDoc.id });
        } else {
          transaction.update(palpiteDoc.ref, { status: 'Perdido' });
        }
      });
      console.log(`${winners.length} ganhadores encontrados. Total de apostas: ${totalBetAmount}`);

      if (winners.length > 0) {
        const initialPrize = bolaoData.initialPrize || 0;
        const prizePercentage = bolaoData.prizePercentage !== undefined ? bolaoData.prizePercentage : 0.9;
        const prizePool = initialPrize + (totalBetAmount * prizePercentage);
        prizePerWinner = prizePool / winners.length;
        console.log(`Prêmio total: ${prizePool}, Prêmio por ganhador: ${prizePerWinner}`);

        for (const winner of winners) {
          const userRef = db.collection(USERS_COLLECTION).doc(winner.userId);
          transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(prizePerWinner) });

          const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc();
          transaction.set(transactionRef, {
            uid: winner.userId,
            type: 'prize_winning',
            amount: prizePerWinner,
            description: `Prêmio ganho no bolão: ${bolaoData.name || bolaoId}`,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: { bolaoId, palpiteId: winner.palpiteId },
          });
        }
      }

      console.log("Operações de escrita na transação concluídas.");
      return { success: true, bolaoId, winnersCount: winners.length, prizePerWinner: prizePerWinner };
    });

    console.log("Resultados do bolão processados com sucesso!", result);
    return NextResponse.json({ success: true, message: "Resultados do bolão processados com sucesso!", ...result }, { status: 200 });

  } catch (error: any) {
    console.error("Erro na API de processamento de resultados do bolão:", error);
    const errorMessage = error.message || 'Erro interno do servidor.';
    
    if (errorMessage.includes('Firestore transactions require all reads to be executed before all writes') || errorMessage.includes('Bolão não encontrado') || errorMessage.includes('Este bolão já foi finalizado') || errorMessage.includes('Configuração do servidor Firebase incompleta')) {
        return NextResponse.json({ message: errorMessage }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
