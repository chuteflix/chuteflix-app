
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Função para inicializar o Firebase Admin SDK de forma segura
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FB_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FB_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FB_ADMIN_PRIVATE_KEY;

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

    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }

    const { transactionId } = await req.json();

    if (!transactionId) {
      return NextResponse.json({ message: 'ID da transação é obrigatório.' }, { status: 400 });
    }

    const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc(transactionId);
    
    const result = await db.runTransaction(async (transaction) => {
      const transactionDoc = await transaction.get(transactionRef);
      if (!transactionDoc.exists) {
        throw new Error('Transação não encontrada.');
      }
      
      const txData = transactionDoc.data();
      if (txData?.status !== 'pending') {
        throw new Error('Só é possível recusar transações pendentes.');
      }

      const userRef = db.collection(USERS_COLLECTION).doc(txData.uid);
      // Estorna o valor para o saldo do usuário (o valor já é negativo)
      transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(-txData.amount) });
      
      // Atualiza o status da transação para 'failed'
      transaction.update(transactionRef, {
        status: 'failed',
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        processedBy: decodedToken.uid,
      });

      return { success: true };
    });

    return NextResponse.json({ ...result, message: 'Saque recusado e saldo estornado.' }, { status: 200 });

  } catch (error: any) {
    console.error("Erro na API de recusa de saque:", error);
    if (error.message.includes('não encontrada') || error.message.includes('pendentes') || error.message.includes('Configuração do servidor Firebase incompleta')) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
