import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Inicializa o Firebase Admin SDK se ele ainda não foi inicializado
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    // Usando prefixo FB_ADMIN_ para evitar conflito com variáveis reservadas do Vercel
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
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
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
    // Garante que o SDK está inicializado antes de usar
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
      return NextResponse.json({ message: 'Token inválido.' }, { status: 401 });
    }

    const callerUid = decodedToken.uid;
    const isAdmin = decodedToken.role === 'admin';

    if (!isAdmin) {
      return NextResponse.json({ message: 'Apenas administradores podem recusar depósitos.' }, { status: 403 });
    }

    const { transactionId } = await req.json();

    if (!transactionId) {
      return NextResponse.json({ message: 'ID da transação é obrigatório.' }, { status: 400 });
    }

    const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc(transactionId);

    await db.runTransaction(async (transaction) => {
      const transactionDoc = await transaction.get(transactionRef);

      if (!transactionDoc.exists) {
        throw new Error('Transação não encontrada.');
      }

      const currentTransaction = transactionDoc.data();
      if (currentTransaction?.status !== 'pending') {
        throw new Error('Transação não está pendente.');
      }

      transaction.update(transactionRef, {
        status: 'failed',
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        processedBy: callerUid,
      });
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Erro na API de recusa de depósito:", error);
    if (error.message === 'Transação não encontrada.' || error.message === 'Transação não está pendente.' || error.message.includes('Configuração do servidor Firebase incompleta')) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
