
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

// Rota para um administrador anular um chute
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
    
    const isAdmin = decodedToken.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ message: 'Apenas administradores podem anular chutes.' }, { status: 403 });
    }

    const { palpiteId } = await req.json();

    if (!palpiteId) {
      return NextResponse.json({ message: 'O ID do palpite é obrigatório.' }, { status: 400 });
    }

    const palpiteRef = db.collection(CHUTES_COLLECTION).doc(palpiteId);

    const result = await db.runTransaction(async (transaction) => {
      const palpiteDoc = await transaction.get(palpiteRef);
      if (!palpiteDoc.exists) {
        throw new Error('Palpite não encontrado.');
      }

      const palpiteData = palpiteDoc.data();
      if (palpiteData?.status !== "Em Aberto" && palpiteData?.status !== "Aprovado") { 
        throw new Error(`Não é possível anular um palpite com status "${palpiteData?.status}".`);
      }
      
      const userId = palpiteData.userId;
      const amount = palpiteData.amount;
      const userRef = db.collection(USERS_COLLECTION).doc(userId);
      
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('Usuário associado ao palpite não encontrado.');
      }

      transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(amount) });
      transaction.update(palpiteRef, { status: "Anulado" });

      const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc();
      transaction.set(transactionRef, {
        uid: userId,
        type: 'bet_refund',
        amount: amount,
        description: `Estorno de aposta anulada: ${palpiteId}`,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        metadata: { palpiteId },
      });

      return { transactionId: transactionRef.id };
    });

    return NextResponse.json({ success: true, message: "Chute anulado e saldo estornado com sucesso!", ...result }, { status: 200 });

  } catch (error: any) {
    console.error("Erro na API de anulação de chute:", error);
    if (error.message.includes('Palpite não encontrado') || error.message.includes('Não é possível anular') || error.message.includes('Usuário associado ao palpite não encontrado') || error.message.includes('Configuração do servidor Firebase incompleta')) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
