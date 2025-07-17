
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();
const db = admin.firestore();

const TRANSACTIONS_COLLECTION = 'transactions';
const USERS_COLLECTION = 'users';
const BOLOES_COLLECTION = 'boloes';
const CHUTES_COLLECTION = 'chutes';

/**
 * Define uma 'custom claim' de função (role) para um usuário.
 * Apenas administradores autenticados podem chamar esta função.
 */
export const setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "A requisição deve ser feita por um usuário autenticado.");
  }
  
  const callerRole = context.auth.token.role;
  if (callerRole !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Apenas administradores podem definir funções de usuário.");
  }

  const { uid, role } = data;
  if (typeof uid !== "string" || typeof role !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "Os dados devem incluir um 'uid' e uma 'role' do tipo string.");
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { role: role });
    // Adicionalmente, vamos salvar a role no documento do usuário para facilitar as buscas no frontend
    await db.collection(USERS_COLLECTION).doc(uid).set({ role: role }, { merge: true });
    
    return { result: `Sucesso! O usuário ${uid} agora tem a função de ${role}.` };
  } catch (error) {
    console.error("Erro ao definir custom claim:", error);
    throw new functions.https.HttpsError("internal", "Ocorreu um erro interno ao tentar definir a função do usuário.");
  }
});

// Função para fazer um palpite (transação atômica)
exports.placeChute = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Você precisa estar logado para fazer um chute.');
    }

    const { bolaoId, scoreTeam1, scoreTeam2, amount, comment } = data;
    const userId = context.auth.uid;

    if (typeof amount !== 'number' || amount <= 0) {
        throw new functions.https.HttpsError('invalid-argument', 'O valor da aposta é inválido.');
    }

    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const bolaoRef = db.collection(BOLOES_COLLECTION).doc(bolaoId);

    return db.runTransaction(async (transaction) => {
        const palpiteQuery = db.collection(CHUTES_COLLECTION)
            .where('userId', '==', userId)
            .where('bolaoId', '==', bolaoId)
            .where('scoreTeam1', '==', scoreTeam1)
            .where('scoreTeam2', '==', scoreTeam2);
            
        const existingPalpite = await transaction.get(palpiteQuery);
        if (!existingPalpite.empty) {
            throw new functions.https.HttpsError('already-exists', 'Você já fez uma aposta com este placar para este bolão.');
        }

        const userDoc = await transaction.get(userRef);
        const currentBalance = userDoc.data()?.balance || 0;

        if (currentBalance < amount) {
            throw new functions.https.HttpsError('failed-precondition', 'Saldo insuficiente.');
        }

        transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(-amount) });

        const palpiteRef = db.collection(CHUTES_COLLECTION).doc();
        const palpiteData = {
            userId,
            bolaoId,
            scoreTeam1,
            scoreTeam2,
            amount,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "Em Aberto",
            ...(comment && { comment }),
        };
        transaction.set(palpiteRef, palpiteData);
        
        const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc();
        transaction.set(transactionRef, {
            uid: userId,
            type: 'bet_placement',
            amount: -amount,
            description: `Aposta no bolão: ${bolaoRef.id}`,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: { bolaoId, palpiteId: palpiteRef.id },
        });

        return { success: true, transactionId: transactionRef.id, palpiteId: palpiteRef.id };
    });
});

exports.payWinner = functions.https.onCall(async (data, context) => {
    const { userId, bolaoId, prizeAmount } = data;

    if (!userId || !bolaoId || typeof prizeAmount !== 'number' || prizeAmount <= 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Argumentos inválidos para pagar o prêmio.');
    }

    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const bolaoRef = db.collection(BOLOES_COLLECTION).doc(bolaoId);

    return db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const bolaoDoc = await transaction.get(bolaoRef);

        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Usuário ${userId} não encontrado.`);
        }
        if (!bolaoDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Bolão ${bolaoId} não encontrado.`);
        }

        transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(prizeAmount) });

        const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc();
        transaction.set(transactionRef, {
            uid: userId,
            type: 'prize_winning',
            amount: prizeAmount,
            description: `Prêmio ganho no bolão: ${bolaoDoc.data()?.name || 'N/A'}`,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: { bolaoId },
        });

        return { success: true, transactionId: transactionRef.id };
    });
});

exports.requestWithdrawal = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Você precisa estar logado para solicitar um saque.');
    }
    
    const { amount, pixKey } = data;
    const userId = context.auth.uid;
    
    if (typeof amount !== 'number' || amount <= 0) {
        throw new functions.https.HttpsError('invalid-argument', 'O valor do saque é inválido.');
    }
    
    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    
    return db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Usuário não encontrado.');
        }
        
        const currentBalance = userDoc.data()?.balance || 0;
        if (currentBalance < amount) {
            throw new functions.https.HttpsError('failed-precondition', 'Saldo insuficiente para realizar o saque.');
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
        
        return { success: true, transactionId: transactionRef.id };
    });
});

exports.approveDeposit = functions.https.onCall(async (data, context) => {
    if (!context.auth || context.auth.token.role !== 'admin') { 
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem aprovar depósitos.');
    }
    
    const { transactionId } = data;
    const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc(transactionId);
    
    return db.runTransaction(async (transaction) => {
        const transactionDoc = await transaction.get(transactionRef);
        if (!transactionDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Transação não encontrada.');
        }
        
        const transactionData = transactionDoc.data();
        if(transactionData?.status !== 'pending') {
            throw new functions.https.HttpsError('failed-precondition', 'Esta transação não está pendente.');
        }

        const userRef = db.collection(USERS_COLLECTION).doc(transactionData.uid);
        transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(transactionData.amount) });
        transaction.update(transactionRef, { status: 'completed' });
    });
});

exports.confirmWithdrawal = functions.https.onCall(async (data, context) => {
    if (!context.auth || context.auth.token.role !== 'admin') { 
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem confirmar saques.');
    }
    
    const { transactionId } = data;
    const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc(transactionId);
    
    return db.runTransaction(async (transaction) => {
        const transactionDoc = await transaction.get(transactionRef);
        if (!transactionDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Transação não encontrada.');
        }
        
        if(transactionDoc.data()?.status !== 'pending') {
            throw new functions.https.HttpsError('failed-precondition', 'Este saque não está pendente.');
        }
        
        transaction.update(transactionRef, { status: 'completed' });
    });
});

exports.declineTransaction = functions.https.onCall(async (data, context) => {
    if (!context.auth || context.auth.token.role !== 'admin') { 
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem recusar transações.');
    }
    
    const { transactionId } = data;
    const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc(transactionId);
    
    return db.runTransaction(async (transaction) => {
        const transactionDoc = await transaction.get(transactionRef);
        if (!transactionDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Transação não encontrada.');
        }
        
        const transactionData = transactionDoc.data();
        if(transactionData?.status !== 'pending') {
            throw new functions.https.HttpsError('failed-precondition', 'Esta transação já foi processada.');
        }
        
        if(transactionData.type === 'withdrawal') {
            const userRef = db.collection(USERS_COLLECTION).doc(transactionData.uid);
            transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(-transactionData.amount) });
        }
        
        transaction.update(transactionRef, { status: 'failed' });
    });
});
