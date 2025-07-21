
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Função para inicializar o Firebase Admin SDK de forma segura
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error("Firebase Admin SDK - Variáveis de ambiente do servidor ausentes.");
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
    const { amount, pixKey } = await req.json();

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ message: 'O valor do saque deve ser um número positivo.' }, { status: 400 });
    }
     if (!pixKey || typeof pixKey !== 'string' || pixKey.trim() === '') {
      return NextResponse.json({ message: 'A chave PIX é obrigatória.' }, { status: 400 });
    }

    const userRef = db.collection(USERS_COLLECTION).doc(userId);

    const transactionId = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('Usuário não encontrado no banco de dados.');
      }
      
      const currentBalance = userDoc.data()?.balance || 0;
      if (currentBalance < amount) {
        throw new Error('Saldo insuficiente para realizar o saque.');
      }
      
      transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(-amount) });
      
      const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc();
      transaction.set(transactionRef, {
        uid: userId,
        type: 'withdrawal',
        amount: -amount,
        description: `Solicitação de saque para a chave PIX: ${pixKey}`,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        metadata: { pixKey },
      });
      
      return transactionRef.id;
    });

    return NextResponse.json({ success: true, transactionId }, { status: 200 });

  } catch (error: any) {
    console.error("Erro na API de solicitação de saque:", error);
    if (error.message === 'Saldo insuficiente para realizar o saque.' || error.message === 'Usuário não encontrado no banco de dados.' || error.message.includes('Configuração do servidor Firebase incompleta')) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
