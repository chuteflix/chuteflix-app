
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

    const transactionDoc = await transactionRef.get();
    if (!transactionDoc.exists || transactionDoc.data()?.status !== 'pending') {
      return NextResponse.json({ message: 'Transação inválida ou não está pendente.' }, { status: 400 });
    }

    await transactionRef.update({
      status: 'completed',
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      processedBy: decodedToken.uid,
    });

    return NextResponse.json({ success: true, message: 'Saque confirmado com sucesso.' }, { status: 200 });

  } catch (error: any) {
    console.error("Erro na API de confirmação de saque:", error);
    if (error.message.includes('Configuração do servidor Firebase incompleta')) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
