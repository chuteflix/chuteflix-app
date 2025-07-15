
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

const CHUTES_COLLECTION = 'chutes';
const TRANSACTIONS_COLLECTION = 'transactions';
const USERS_COLLECTION = 'users';
const BOLOES_COLLECTION = 'boloes';

// Função para fazer um palpite (transação atômica)
exports.placeChute = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Você precisa estar logado para fazer um chute.');
    }

    const { bolaoId, scoreTeam1, scoreTeam2, amount } = data;
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

        const [userDoc, bolaoDoc] = await Promise.all([
            transaction.get(userRef),
            transaction.get(bolaoRef)
        ]);
        
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Usuário não encontrado.');
        }
        if (!bolaoDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Bolão não encontrado.');
        }

        const currentBalance = userDoc.data()?.balance || 0;
        if (currentBalance < amount) {
            throw new functions.https.HttpsError('failed-precondition', 'Saldo insuficiente.');
        }

        transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(-amount) });

        const palpiteRef = db.collection(CHUTES_COLLECTION).doc();
        transaction.set(palpiteRef, {
            userId,
            bolaoId,
            scoreTeam1,
            scoreTeam2,
            amount,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "Em Aberto", 
        });
        
        const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc();
        transaction.set(transactionRef, {
            uid: userId,
            type: 'bet_placement',
            amount: -amount,
            description: `Aposta no bolão: ${bolaoDoc.data()?.name || 'N/A'}`,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: { bolaoId, palpiteId: palpiteRef.id },
        });

        return { success: true, message: "Chute realizado com sucesso!" };
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
    if (!pixKey || typeof pixKey !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'A chave PIX é obrigatória.');
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

        // Debita o saldo imediatamente
        transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(-amount) });

        // Cria a transação de saque com status pendente
        const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc();
        transaction.set(transactionRef, {
            uid: userId,
            type: 'withdrawal',
            amount: -amount, // Valor negativo para representar saída
            description: `Solicitação de saque para a chave PIX: ${pixKey}`,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: { pixKey },
        });

        return { success: true, transactionId: transactionRef.id };
    });
});

// Funções de depósito e saque
exports.approveDeposit = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin) { 
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem aprovar depósitos.');
    }

    const { transactionId } = data;
    if (!transactionId) {
        throw new functions.https.HttpsError('invalid-argument', 'O ID da transação é obrigatório.');
    }
    
    const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc(transactionId);

    return db.runTransaction(async (transaction) => {
        const transactionDoc = await transaction.get(transactionRef);

        if (!transactionDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Transação não encontrada.');
        }

        const transactionData = transactionDoc.data()!;
        if (transactionData.status !== 'pending') {
            throw new functions.https.HttpsError('failed-precondition', 'Este depósito já foi processado.');
        }

        const userRef = db.collection(USERS_COLLECTION).doc(transactionData.uid);
        
        transaction.update(userRef, {
            balance: admin.firestore.FieldValue.increment(transactionData.amount)
        });

        transaction.update(transactionRef, { status: 'completed' });
    });
});

exports.declineTransaction = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin) { 
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem recusar transações.');
    }

    const { transactionId } = data;
    if (!transactionId) {
        throw new functions.https.HttpsError('invalid-argument', 'O ID da transação é obrigatório.');
    }

    const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc(transactionId);

    return db.runTransaction(async (transaction) => {
        const transactionDoc = await transaction.get(transactionRef);
        if (!transactionDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Transação não encontrada.');
        }

        const transactionData = transactionDoc.data()!;
        if (transactionData.status !== 'pending') {
            throw new functions.https.HttpsError('failed-precondition', 'Esta transação já foi processada.');
        }
        
        // Se for um saque recusado, estorna o valor para o usuário
        if(transactionData.type === 'withdrawal') {
            const userRef = db.collection(USERS_COLLECTION).doc(transactionData.uid);
             // O valor é negativo, então incrementar com -(-valor) = +valor
            transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(-transactionData.amount) });
        }

        transaction.update(transactionRef, { status: 'failed' });
    });
});

exports.confirmWithdrawal = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem confirmar saques.');
    }
    
    const { transactionId } = data;
    if (!transactionId ) {
        throw new functions.https.HttpsError('invalid-argument', 'O ID da transação é obrigatório.');
    }

    const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc(transactionId);

    return db.runTransaction(async (transaction) => {
        const transactionDoc = await transaction.get(transactionRef);
        if (!transactionDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Transação não encontrada.');
        }

        const transactionData = transactionDoc.data()!;
        if (transactionData.status !== 'pending') {
            throw new functions.https.HttpsError('failed-precondition', 'Este saque já foi processado.');
        }

        transaction.update(transactionRef, { status: 'completed' });
    });
});
