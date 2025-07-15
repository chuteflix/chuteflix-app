
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

const CHUTES_COLLECTION = 'chutes';

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

    const userRef = db.collection('users').doc(userId);
    const palpiteRef = db.collection(CHUTES_COLLECTION).doc(); // Corrigido
    const transactionRef = db.collection('transactions').doc();
    const bolaoRef = db.collection('boloes').doc(bolaoId);

    return db.runTransaction(async (transaction) => {
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
        const newBalance = currentBalance - amount;
        transaction.update(userRef, { balance: newBalance });

        transaction.set(palpiteRef, {
            id: palpiteRef.id,
            userId,
            bolaoId,
            scoreTeam1,
            scoreTeam2,
            amount,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "Em Aberto", // Status correto
        });
        
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

// Função para anular um palpite (callable por admin)
exports.anularChute = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem anular palpites.');
    }

    const { palpiteId } = data;
    if (!palpiteId) {
        throw new functions.https.HttpsError('invalid-argument', 'O ID do palpite é obrigatório.');
    }

    const palpiteRef = db.collection(CHUTES_COLLECTION).doc(palpiteId); // Corrigido

    return db.runTransaction(async (transaction) => {
        const palpiteDoc = await transaction.get(palpiteRef);
        if (!palpiteDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Palpite não encontrado.');
        }

        const palpiteData = palpiteDoc.data()!;
        if (palpiteData.status !== "Em Aberto" && palpiteData.status !== "Aprovado") { // Retrocompatibilidade
            throw new functions.https.HttpsError('failed-precondition', `Não é possível anular um palpite com status "${palpiteData.status}".`);
        }
        
        const userId = palpiteData.userId;
        const amount = palpiteData.amount;
        const userRef = db.collection('users').doc(userId);
        const transactionRef = db.collection('transactions').doc();
        
        const userDoc = await transaction.get(userRef);
        const currentBalance = userDoc.data()?.balance || 0;
        const newBalance = currentBalance + amount;
        transaction.update(userRef, { balance: newBalance });

        transaction.update(palpiteRef, { status: "Anulado" });

        transaction.set(transactionRef, {
            uid: userId,
            type: 'bet_refund',
            amount: amount,
            description: `Estorno de aposta anulada`,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: { palpiteId },
        });
    });
});

// Função para pagar o prêmio a um vencedor (interna, não callable)
exports.payWinner = functions.https.onCall(async (data, context) => {
     if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Operação restrita.');
    }
    
    const { userId, bolaoId } = data;
    const bolaoRef = db.collection('boloes').doc(bolaoId);
    const userRef = db.collection('users').doc(userId);
    const transactionRef = db.collection('transactions').doc();
    
    return db.runTransaction(async (transaction) => {
        const [bolaoDoc, userDoc] = await Promise.all([
            transaction.get(bolaoRef),
            transaction.get(userRef),
        ]);

        if (!bolaoDoc.exists || !userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Bolão ou usuário não encontrado.');
        }
        
        const prize = bolaoDoc.data()?.prize;
        if (typeof prize !== 'number' || prize <= 0) {
            throw new functions.https.HttpsError('internal', 'O valor do prêmio é inválido.');
        }
        
        const currentBalance = userDoc.data()?.balance || 0;
        const newBalance = currentBalance + prize;
        
        transaction.update(userRef, { balance: newBalance });
        
        transaction.set(transactionRef, {
            uid: userId,
            type: 'prize_payment',
            amount: prize,
            description: `Prêmio do bolão: ${bolaoDoc.data()?.name || 'N/A'}`,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: { bolaoId },
        });
    });
});

// Funções de depósito e saque
exports.approveDeposit = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin) { 
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem aprovar depósitos.');
    }
    // ... (código mantido)
});

exports.confirmWithdrawal = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem confirmar saques.');
    }
    // ... (código mantido)
});
