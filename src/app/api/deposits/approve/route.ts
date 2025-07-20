import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Inicializa o Firebase Admin SDK se ele ainda não foi inicializado
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    // A API Route é server-side, mas para o build do Vercel funcionar,
    // precisamos ler as variáveis com o prefixo NEXT_PUBLIC_ que configuramos.
    const privateKey = process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY
      ? process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY.replace(/
/g, '
')
      : undefined;

    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || !process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL || !privateKey) {
      console.error("Firebase Admin SDK - Variáveis de ambiente não configuradas corretamente.");
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
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
    // Garante que o SDK está inicializado antes de usar
    if (!admin.apps.length) {
      initializeFirebaseAdmin(); // Tenta inicializar novamente se não estiver pronto
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
    const isAdmin = decodedToken.role === 'admin'; // Custom claims estão diretamente no token decodificado

    if (!isAdmin) {
      return NextResponse.json({ message: 'Apenas administradores podem aprovar depósitos.' }, { status: 403 });
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
      const userRef = db.collection(USERS_COLLECTION).doc(currentTransaction.uid);
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('Usuário não encontrado.');
      }
      const amount = currentTransaction.amount;
      transaction.update(userRef, {
        balance: admin.firestore.FieldValue.increment(amount),
      });
      transaction.update(transactionRef, {
        status: 'completed',
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        processedBy: callerUid,
      });
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Erro na API de aprovação de depósito:", error);
    if (error.message === 'Transação não encontrada.' || error.message === 'Transação não está pendente.' || error.message === 'Usuário não encontrado.') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
