
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Função para inicializar o Firebase Admin SDK de forma segura
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FB_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FB_ADMIN_CLIENT_EMAIL;
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
const CHUTES_COLLECTION = 'chutes';
const BOLOES_COLLECTION = 'boloes';

// Rota para fazer uma aposta (palpite/chute)
export async function POST(req: Request) {
  try {
    initializeFirebaseAdmin();
    const db = admin.firestore();

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Não autenticado. Nenhum token fornecido.' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
        console.error("Erro ao verificar token de autenticação:", error);
        return NextResponse.json({ message: 'Token inválido ou expirado.' }, { status: 401 });
    }
    
    const userId = decodedToken.uid;
    const { bolaoId, scoreTeam1, scoreTeam2, betAmount, comment } = await req.json();

    if (!userId || !bolaoId || typeof scoreTeam1 !== 'number' || typeof scoreTeam2 !== 'number' || typeof betAmount !== 'number') {
      return NextResponse.json({ message: 'Dados da aposta inválidos.' }, { status: 400 });
    }

    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const bolaoRef = db.collection(BOLOES_COLLECTION).doc(bolaoId);

    const chuteId = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const bolaoDoc = await transaction.get(bolaoRef);

      if (!userDoc.exists) throw new Error('Usuário não encontrado.');
      if (!bolaoDoc.exists) throw new Error('Bolão não encontrado.');

      const userData = userDoc.data()!;
      const bolaoData = bolaoDoc.data()!;

      if (bolaoData.status !== 'Aberto') {
        throw new Error('Este bolão não está aberto para novas apostas.');
      }
      
      if (bolaoData.betAmount !== betAmount) {
        throw new Error('O valor da aposta não corresponde ao valor do bolão.');
      }

      if (userData.balance < betAmount) {
        throw new Error('Saldo insuficiente para fazer a aposta.');
      }

      // Debita o valor do saldo do usuário
      transaction.update(userRef, {
        balance: admin.firestore.FieldValue.increment(-betAmount)
      });
      
      // Cria o documento do chute
      const chuteRef = db.collection(CHUTES_COLLECTION).doc();
      transaction.set(chuteRef, {
        userId,
        bolaoId,
        scoreTeam1,
        scoreTeam2,
        amount: betAmount,
        comment: comment || null,
        status: 'Em Aberto',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // Cria a transação de débito
      const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc();
      transaction.set(transactionRef, {
        uid: userId,
        type: 'bet_placement',
        amount: -betAmount,
        description: `Aposta no bolão: ${bolaoId}`,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
            bolaoId: bolaoId,
            chuteId: chuteRef.id,
        },
      });

      return chuteRef.id;
    });

    return NextResponse.json({ success: true, chuteId: chuteId }, { status: 200 });

  } catch (error: any) {
    console.error('Erro ao fazer aposta:', error);
    const errorMessage = error.message || 'Ocorreu um erro desconhecido.';
    // Retorna status 400 para erros de validação ou de negócio
    if (errorMessage.includes('não encontrado') || errorMessage.includes('inválidos') || errorMessage.includes('Saldo insuficiente') || errorMessage.includes('não está aberto')) {
        return NextResponse.json({ message: errorMessage }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
