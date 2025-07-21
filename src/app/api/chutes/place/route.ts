
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Função para inicializar o Firebase Admin SDK de forma segura
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    console.log("--- Iniciando diagnóstico do Firebase Admin SDK ---");

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Log de diagnóstico para verificar se as variáveis de ambiente estão sendo lidas
    console.log("FIREBASE_PROJECT_ID:", projectId ? "Encontrado" : "NÃO ENCONTRADO OU VAZIO");
    console.log("FIREBASE_CLIENT_EMAIL:", clientEmail ? "Encontrado" : "NÃO ENCONTRADO OU VAZIO");
    console.log("FIREBASE_PRIVATE_KEY:", privateKey ? "Encontrado" : "NÃO ENCONTRADO OU VAZIO");

    if (!projectId || !clientEmail || !privateKey) {
      console.error("Firebase Admin SDK - ERRO FATAL: Uma ou mais variáveis de ambiente do servidor estão ausentes.");
      console.log("-------------------------------------------------");
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
      console.log("Firebase Admin SDK inicializado com SUCESSO.");
      console.log("-------------------------------------------------");
    } catch (error) {
      console.error("Firebase Admin SDK - ERRO FATAL ao inicializar:", error);
      console.log("-------------------------------------------------");
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
      return NextResponse.json({ message: 'Token inválido.' }, { status: 401 });
    }
    
    const userId = decodedToken.uid;
    const { bolaoId, scoreTeam1, scoreTeam2, comment } = await req.json();

    if (!bolaoId || typeof scoreTeam1 !== 'number' || typeof scoreTeam2 !== 'number') {
        return NextResponse.json({ message: 'Dados da aposta inválidos.' }, { status: 400 });
    }

    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const bolaoRef = db.collection(BOLOES_COLLECTION).doc(bolaoId);

    const result = await db.runTransaction(async (transaction) => {
      const bolaoDoc = await transaction.get(bolaoRef);
      if (!bolaoDoc.exists) {
        throw new Error('Bolão não encontrado.');
      }
      const betAmount = bolaoDoc.data()?.betAmount;
      const bolaoName = bolaoDoc.data()?.championship || 'Nome não encontrado';

      if (typeof betAmount !== 'number' || betAmount <= 0) {
        throw new Error('O valor da aposta configurado para este bolão é inválido.');
      }
      
      const chuteQuery = db.collection(CHUTES_COLLECTION)
            .where('userId', '==', userId)
            .where('bolaoId', '==', bolaoId)
            .where('scoreTeam1', '==', scoreTeam1)
            .where('scoreTeam2', '==', scoreTeam2);
      const existingChute = await transaction.get(chuteQuery);
      if (!existingChute.empty) {
          throw new Error('Você já fez um chute com este mesmo placar para este bolão.');
      }

      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('Usuário não encontrado.');
      }
      const currentBalance = userDoc.data()?.balance || 0;
      if (currentBalance < betAmount) {
        throw new Error('Saldo insuficiente para fazer a aposta.');
      }

      transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(-betAmount) });

      const chuteRef = db.collection(CHUTES_COLLECTION).doc();
      transaction.set(chuteRef, {
        userId,
        bolaoId,
        scoreTeam1,
        scoreTeam2,
        amount: betAmount,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "Em Aberto",
        ...(comment && { comment }),
      });
      
      const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc();
      transaction.set(transactionRef, {
        uid: userId,
        type: 'bet_placement',
        amount: -betAmount,
        description: `Aposta no bolão: ${bolaoName}`,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        metadata: { bolaoId, chuteId: chuteRef.id },
      });

      return { chuteId: chuteRef.id, transactionId: transactionRef.id };
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });

  } catch (error: any) {
    console.error("Erro na API de realizar aposta:", error);
    if (error.message.includes('Bolão não encontrado') || error.message.includes('inválido') || error.message.includes('Você já fez um chute') || error.message.includes('Saldo insuficiente') || error.message.includes('Configuração do servidor Firebase incompleta')) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
