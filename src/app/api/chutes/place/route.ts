import { NextResponse } from 'next/server';
import { db, auth, admin } from '@/lib/firebase-admin'; // Usar o admin SDK
import { FieldValue } from 'firebase-admin/firestore';

const USERS_COLLECTION = 'users';
const BOLOES_COLLECTION = 'boloes';
const CHUTES_COLLECTION = 'chutes';
const TRANSACTIONS_COLLECTION = 'transactions';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json({ message: 'Token inválido.' }, { status: 401 });
    }
    
    const userId = decodedToken.uid;
    const { bolaoId, scoreTeam1, scoreTeam2, comment } = await req.json();

    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const bolaoRef = db.collection(BOLOES_COLLECTION).doc(bolaoId);

    const result = await db.runTransaction(async (transaction) => {
      // 1. LEITURAS PRIMEIRO
      const bolaoDoc = await transaction.get(bolaoRef);
      if (!bolaoDoc.exists) {
        throw new Error('Bolão não encontrado.');
      }
      
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('Usuário não encontrado.');
      }

      // 2. LÓGICA E VALIDAÇÕES
      const bolaoData = bolaoDoc.data();
      if (bolaoData?.status !== 'Aberto') {
        throw new Error('Este bolão não está aberto para novas apostas.');
      }

      const betAmount = bolaoData?.betAmount || 0;
      if (betAmount <= 0) {
          throw new Error('O valor da aposta para este bolão é inválido.');
      }

      const userData = userDoc.data();
      const userBalance = userData?.balance || 0;

      if (userBalance < betAmount) {
        throw new Error('Saldo insuficiente para fazer a aposta.');
      }

      // 3. ESCRITAS NO FINAL
      // Deduz o valor da aposta do saldo do usuário
      transaction.update(userRef, { balance: FieldValue.increment(-betAmount) });

      // Cria o novo chute
      const chuteRef = db.collection(CHUTES_COLLECTION).doc();
      transaction.set(chuteRef, {
        bolaoId,
        userId,
        scoreTeam1,
        scoreTeam2,
        amount: betAmount, // Usa o valor do bolão
        comment,
        createdAt: FieldValue.serverTimestamp(),
        status: 'Em Aberto' // Status inicial
      });

      // Cria a transação de débito
      const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc();
      transaction.set(transactionRef, {
        uid: userId,
        type: 'bet_placement',
        amount: -betAmount, // Valor negativo para débito
        description: `Aposta no bolão: ${bolaoData.name || bolaoId}`,
        status: 'completed',
        createdAt: FieldValue.serverTimestamp(),
        metadata: {
            bolaoId: bolaoId,
            chuteId: chuteRef.id
        }
      });

      return { chuteId: chuteRef.id };
    });

    return NextResponse.json({ message: 'Aposta realizada com sucesso!', chuteId: result.chuteId }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao realizar aposta:', error);
    // Retorna a mensagem de erro específica da transação ou uma genérica
    return NextResponse.json({ message: error.message || 'Erro interno do servidor.' }, { status: 400 }); // Status 400 para erros de regra de negócio
  }
}
