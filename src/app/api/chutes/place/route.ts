
import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin'; // <-- IMPORTAÇÃO CORRETA
import { FieldValue } from 'firebase-admin/firestore';

// Rota para fazer uma aposta
export async function POST(req: Request) {
  try {
    const { bolaoId, userId, palpites } = await req.json();

    if (!userId || !bolaoId || !palpites || palpites.length === 0) {
      return NextResponse.json({ error: 'Dados da aposta inválidos.' }, { status: 400 });
    }

    const userRef = db.collection('users').doc(userId);
    const bolaoRef = db.collection('boloes').doc(bolaoId);
    const apostaRef = db.collection('apostas').doc(); // Cria uma nova aposta

    // Inicia uma transação para garantir a consistência dos dados
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const bolaoDoc = await transaction.get(bolaoRef);

      if (!userDoc.exists) {
        throw new Error('Usuário não encontrado.');
      }
      if (!bolaoDoc.exists) {
        throw new Error('Bolão não encontrado.');
      }

      const userData = userDoc.data()!;
      const bolaoData = bolaoDoc.data()!;
      const valorAposta = bolaoData.valorAposta || 0;

      // Verifica se o usuário tem saldo suficiente
      if (userData.balance < valorAposta) {
        throw new Error('Saldo insuficiente para fazer a aposta.');
      }

      // Debita o valor da aposta do saldo do usuário
      transaction.update(userRef, {
        balance: FieldValue.increment(-valorAposta)
      });

      // Cria a nova aposta
      transaction.set(apostaRef, {
        userId,
        bolaoId,
        palpites,
        valor: valorAposta,
        status: 'pendente',
        createdAt: FieldValue.serverTimestamp()
      });

      // Incrementa o contador de apostas e o total arrecadado no bolão
      transaction.update(bolaoRef, {
        totalApostas: FieldValue.increment(1),
        totalArrecadado: FieldValue.increment(valorAposta)
      });
    });

    return NextResponse.json({ success: true, apostaId: apostaRef.id }, { status: 200 });

  } catch (error) {
    console.error('Erro ao fazer aposta:', error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
