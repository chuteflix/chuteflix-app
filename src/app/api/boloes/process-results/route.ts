
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Função para inicializar o Firebase Admin SDK de forma segura
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FB_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FB_ADMIN_CLIENT_EMAIL;
    // CORREÇÃO: Trata a chave privada para garantir que as quebras de linha sejam interpretadas corretamente.
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
  try {
    initializeFirebaseAdmin();
    const db = admin.firestore();

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error("Erro ao verificar token de autenticação:", error);
      return NextResponse.json({ message: 'Token inválido ou expirado.' }, { status: 401 });
    }

    const isAdmin = decodedToken.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ message: 'Apenas administradores podem processar resultados de bolões.' }, { status: 403 });
    }

    const { bolaoId, scoreTeam1, scoreTeam2 } = await req.json();

    if (!bolaoId || typeof scoreTeam1 !== 'number' || typeof scoreTeam2 !== 'number') {
      return NextResponse.json({ message: 'Dados do resultado do bolão inválidos ou ausentes.' }, { status: 400 });
    }

    const result = await db.runTransaction(async (transaction) => {
      const bolaoRef = db.collection(BOLOES_COLLECTION).doc(bolaoId);
      const bolaoDoc = await transaction.get(bolaoRef);

      if (!bolaoDoc.exists) {
        throw new Error('Bolão não encontrado.');
      }

      const bolaoData = bolaoDoc.data();
      if (bolaoData?.status === 'Finalizado') {
        throw new Error('Este bolão já foi finalizado.');
      }

      transaction.update(bolaoRef, {
        finalScoreTeam1: scoreTeam1,
        finalScoreTeam2: scoreTeam2,
        status: 'Finalizado',
      });

      const palpitesQuery = db.collection(CHUTES_COLLECTION)
        .where('bolaoId', '==', bolaoId)
        .where('status', 'in', ['Em Aberto', 'Aprovado']);

      const palpitesSnapshot = await transaction.get(palpitesQuery);

      const winners: { userId: string; amount: number; palpiteId: string; }[] = [];
      let totalBetAmount = 0;

      if (palpitesSnapshot.empty) {
        console.warn(`Nenhum palpite encontrado para o bolão ${bolaoId} com status 'Em Aberto' ou 'Aprovado'.`);
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

      let prizePerWinner = 0;
      if (winners.length > 0) {
        const initialPrize = bolaoData.initialPrize || 0;
        const prizePool = initialPrize + (totalBetAmount * (bolaoData.prizePercentage || 0.9)); 
        prizePerWinner = prizePool / winners.length;

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

      return { success: true, bolaoId, winnersCount: winners.length, prizePerWinner };
    });

    return NextResponse.json({ success: true, message: "Resultados do bolão processados com sucesso!", ...result }, { status: 200 });

  } catch (error: any) {
    console.error("Erro na API de processamento de resultados do bolão:", error);
    if (error.message.includes('Bolão não encontrado') || error.message.includes('Este bolão já foi finalizado') || error.message.includes('Configuração do servidor Firebase incompleta')) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
