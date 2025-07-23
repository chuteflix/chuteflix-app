import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin';

const USERS_COLLECTION = 'users';
const BOLOES_COLLECTION = 'boloes';
const CHUTES_COLLECTION = 'chutes';

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
    const { bolaoId, scoreTeam1, scoreTeam2, betAmount, comment } = await req.json();

    if (!bolaoId || typeof scoreTeam1 !== 'number' || scoreTeam1 < 0 || typeof scoreTeam2 !== 'number' || scoreTeam2 < 0 || typeof betAmount !== 'number' || betAmount <= 0) {
        return NextResponse.json({ message: 'Dados da aposta inválidos.' }, { status: 400 });
    }

    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const bolaoRef = db.collection(BOLOES_COLLECTION).doc(bolaoId);

    const result = await db.runTransaction(async (transaction) => {
      const bolaoDoc = await transaction.get(bolaoRef);
      if (!bolaoDoc.exists) {
        throw new Error('Bolão não encontrado.');
      }
      const bolaoData = bolaoDoc.data();
      if (bolaoData?.status !== 'open') {
        throw new Error('Este bolão não está aberto para novas apostas.');
      }

      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('Usuário não encontrado.');
      }
      const userData = userDoc.data();
      const userBalance = userData?.balance || 0;

      if (userBalance < betAmount) {
        throw new Error('Saldo insuficiente para fazer a aposta.');
      }

      // Deduz o valor da aposta do saldo do usuário
      transaction.update(userRef, { balance: userBalance - betAmount });

      // Cria o novo chute
      const chuteRef = db.collection(CHUTES_COLLECTION).doc();
      transaction.set(chuteRef, {
        bolaoId,
        userId,
        scoreTeam1,
        scoreTeam2,
        betAmount,
        comment,
        createdAt: new Date(),
        status: 'validated'
      });

      return { chuteId: chuteRef.id };
    });

    return NextResponse.json({ message: 'Aposta realizada com sucesso!', chuteId: result.chuteId }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao realizar aposta:', error);
    // Retorna a mensagem de erro específica da transação ou uma genérica
    return NextResponse.json({ message: error.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}
