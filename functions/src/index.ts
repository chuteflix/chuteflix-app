
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();
const db = admin.firestore();

const TRANSACTIONS_COLLECTION = 'transactions';
const USERS_COLLECTION = 'users';
const BOLOES_COLLECTION = 'boloes';
const CHUTES_COLLECTION = 'chutes';

export const setUserRole = functions.https.onCall(async (data, context) => {
    // ... (código existente, sem alterações)
});

// VERSÃO CORRIGIDA E SEGURA, BASEADA NA LÓGICA ESTÁVEL
exports.placeChute = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Você precisa estar logado para fazer um chute.');
    }

    const { bolaoId, scoreTeam1, scoreTeam2, comment } = data; // O valor da aposta não vem mais do frontend
    const userId = context.auth.uid;

    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const bolaoRef = db.collection(BOLOES_COLLECTION).doc(bolaoId);

    return db.runTransaction(async (transaction) => {
        // 1. Lê os dados do bolão DIRETAMENTE do banco de dados (fonte da verdade)
        const bolaoDoc = await transaction.get(bolaoRef);
        if (!bolaoDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Bolão não encontrado.');
        }
        const betAmount = bolaoDoc.data()?.betAmount; // Usa o valor do banco
        
        // 2. Valida o valor da aposta obtido do banco
        if (typeof betAmount !== 'number' || betAmount <= 0) {
            throw new functions.https.HttpsError('invalid-argument', 'O valor da aposta configurado para este bolão é inválido.');
        }

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

        if (currentBalance < betAmount) {
            throw new functions.https.HttpsError('failed-precondition', 'Saldo insuficiente.');
        }

        transaction.update(userRef, { balance: admin.firestore.FieldValue.increment(-betAmount) });

        const palpiteRef = db.collection(CHUTES_COLLECTION).doc();
        transaction.set(palpiteRef, {
            userId,
            bolaoId,
            scoreTeam1,
            scoreTeam2,
            amount: betAmount,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "Em Aberto",
            ...(comment && { comment }),
        });
        
        const transactionRef = db.collection(TRANSACTIONS_COLLECTION).doc();
        transaction.set(transactionRef, {
            uid: userId,
            type: 'bet_placement',
            amount: -betAmount,
            description: `Aposta no bolão: ${bolaoDoc.data()?.championship}`,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: { bolaoId, palpiteId: palpiteRef.id },
        });

        return { success: true, transactionId: transactionRef.id, palpiteId: palpiteRef.id };
    });
});

// ... (Restante das funções sem alterações) ...
exports.payWinner = functions.https.onCall(async (data, context) => {
    // ...
});
exports.requestWithdrawal = functions.https.onCall(async (data, context) => {
    // ...
});
exports.approveDeposit = functions.https.onCall(async (data, context) => {
    // ...
});
exports.confirmWithdrawal = functions.https.onCall(async (data, context) => {
    // ...
});
exports.declineTransaction = functions.https.onCall(async (data, context) => {
    // ...
});
