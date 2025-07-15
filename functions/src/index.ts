
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

exports.onPalpiteStatusChangeV1 = functions.firestore
    .document("palpites/{palpiteId}")
    .onUpdate(async (change, context) => {
        functions.logger.info(`Palpite ${context.params.palpiteId} status change detected.`);

        const before = change.before.data();
        const after = change.after.data();

        if (!before || !after) {
            functions.logger.error("Data missing in change event.");
            return null;
        }

        if (before.status === after.status || after.status !== "Aprovado") {
            functions.logger.info(`Status not changed to 'Aprovado'. No action taken.`);
            return null;
        }

        functions.logger.info(`Status changed to 'Aprovado' for palpite ${context.params.palpiteId}.`);

        const palpiteId = context.params.palpiteId;
        const batch = db.batch();

        try {
            const transacoesRef = db.collection("transactions");
            const q = transacoesRef.where("metadata.palpiteId", "==", palpiteId);
            const transacoesSnapshot = await q.get();
            
            if (transacoesSnapshot.empty) {
                functions.logger.warn(`No transaction found for palpiteId: ${palpiteId}`);
                return null;
            }

            transacoesSnapshot.forEach(doc => {
                functions.logger.info(`Updating transaction ${doc.id} to 'completed'.`);
                batch.update(doc.ref, { status: "completed" });
            });
            
            await batch.commit();
            functions.logger.info(`Successfully updated transaction status for palpite ${palpiteId}.`);
            return { success: true };

        } catch (error) {
            functions.logger.error("Error updating transaction status:", error);
            return { success: false, error: error };
        }
    });

exports.placeChute = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Você precisa estar logado para fazer um chute.');
    }

    const { bolaoId, scoreTeam1, scoreTeam2, comment, fee, bolaoName } = data;
    const userId = context.auth.uid;

    const userRef = db.collection('users').doc(userId);
    const chuteRef = db.collection('chutes').doc();
    const transactionRef = db.collection('transactions').doc();

    return db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Usuário não encontrado.');
        }

        const currentBalance = userDoc.data()?.balance || 0;
        if (currentBalance < fee) {
            throw new functions.https.HttpsError('failed-precondition', 'Saldo insuficiente.');
        }

        const newBalance = currentBalance - fee;
        transaction.update(userRef, { balance: newBalance });

        transaction.set(chuteRef, {
            id: chuteRef.id,
            userId,
            bolaoId,
            scoreTeam1,
            scoreTeam2,
            comment: comment || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "Aprovado",
        });
        
        transaction.set(transactionRef, {
            uid: userId,
            type: 'bet_placement',
            amount: -fee,
            description: `Chute no bolão: ${bolaoName}`,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: { bolaoId, chuteId: chuteRef.id },
        });

        return { success: true, message: "Chute realizado com sucesso!" };
    });
});

exports.approveDeposit = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin) { 
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem aprovar depósitos.');
    }

    const { depositId, userId, amount } = data;

    const depositRef = db.collection('deposits').doc(depositId);
    const userRef = db.collection('users').doc(userId);
    const transactionRef = db.collection('transactions').doc();

    return db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Usuário não encontrado.');
        }

        const currentBalance = userDoc.data()?.balance || 0;
        const newBalance = currentBalance + amount;

        transaction.update(depositRef, { status: 'aprovado' });
        transaction.update(userRef, { balance: newBalance });
        transaction.set(transactionRef, {
            uid: userId,
            type: 'deposit',
            amount: amount,
            description: `Depósito aprovado`,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: { depositId },
        });

        return { success: true, message: "Depósito aprovado com sucesso!" };
    });
});

exports.confirmWithdrawal = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem confirmar saques.');
    }

    const { withdrawalId, userId, amount } = data;

    const withdrawalRef = db.collection('withdrawals').doc(withdrawalId);
    const userRef = db.collection('users').doc(userId);
    const transactionRef = db.collection('transactions').doc();

    return db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Usuário não encontrado.');
        }

        const currentBalance = userDoc.data()?.balance || 0;
        if (currentBalance < amount) {
            throw new functions.https.HttpsError('failed-precondition', 'Saldo insuficiente para este saque.');
        }

        const newBalance = currentBalance - amount;

        transaction.update(withdrawalRef, { status: 'concluido' });
        transaction.update(userRef, { balance: newBalance });
        transaction.set(transactionRef, {
            uid: userId,
            type: 'withdrawal',
            amount: -amount,
            description: `Saque confirmado`,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: { withdrawalId },
        });

        return { success: true, message: "Saque confirmado com sucesso!" };
    });
});
