import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Inicializa o Firebase Admin SDK se ele ainda não foi inicializado
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error("Firebase Admin SDK - Variáveis de ambiente ausentes ou inválidas.");
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey,
      }),
    });
  }
}

initializeFirebaseAdmin();

const db = admin.firestore();
const USERS_COLLECTION = 'users';
const TRANSACTIONS_COLLECTION = 'transactions';

export async function POST(req: Request) {
  try {
    if (!admin.apps.length) {
      initializeFirebaseAdmin();
      if(!admin.apps.length){
        return NextResponse.json({ message: 'Erro de configuração do servidor.' }, { status: 500 });
      }
    }

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

    console.log(`Decline API: Attempting to decline transaction ${transactionId}`);

    await db.runTransaction(async (transaction) => {
      const transactionDoc = await transaction.get(transactionRef);

      if (!transactionDoc.exists) {
        console.error(`Decline API: Transaction ${transactionId} not found.`);
        throw new Error('Transação não encontrada.');
      }

      const currentTransaction = transactionDoc.data();

      console.log(`Decline API: Transaction ${transactionId} current status: ${currentTransaction?.status}`);
      if (currentTransaction?.status !== 'pending') {
        console.warn(`Decline API: Transaction ${transactionId} is not pending. Current status: ${currentTransaction?.status}`);
        throw new Error('Transação não está pendente.');
      }

      transaction.update(transactionRef, {
        status: 'failed',
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        processedBy: callerUid,
      });
      console.log(`Decline API: Transaction ${transactionId} status updated to 'failed'.`);
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Erro na API de recusa de depósito:", error);
    if (error.message === 'Transação não encontrada.' || error.message === 'Transação não está pendente.') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
