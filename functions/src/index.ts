
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();
const db = admin.firestore();

// Este arquivo agora está quase vazio pois todas as funções relacionadas a transações
// e gerenciamento de saldo foram migradas para as API Routes do Next.js (Vercel).
// Mantenha apenas funções de Firebase que são ESTRICTAMENTE NECESSÁRIAS e que não
// podem ser substituídas por uma API Route (ex: triggers de Firestore, etc.).

// Se a função setUserRole ainda for utilizada, ela deve ser migrada para uma API Route
// para seguir o padrão da nova arquitetura e ser chamada do frontend via HTTP.
// Caso contrário, esta função também pode ser removida.
// Por enquanto, será deixada como um esqueleto ou totalmente removida se confirmado.

// Funções antigas de saldo atômico e transações (agora no Vercel):
// exports.placeChute = functions.https.onCall(async (data, context) => { /* ... */ });
// exports.payWinner = functions.https.onCall(async (data, context) => { /* ... */ });
// exports.requestWithdrawal = functions.https.onCall(async (data, context) => { /* ... */ });
// exports.approveDeposit = functions.https.onCall(async (data, context) => { /* ... */ });
// exports.confirmWithdrawal = functions.https.onCall(async (data, context) => { /* ... */ });
// exports.declineTransaction = functions.https.onCall(async (data, context) => { /* ... */ });

// Lógica para setUserRole foi removida daqui, pois também deve ser migrada para uma API Route segura no Vercel.
// Exemplo de como era (comentado): 
/*
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
    await db.collection(USERS_COLLECTION).doc(uid).set({ role: role }, { merge: true });
    return { result: `Sucesso! O usuário ${uid} agora tem a função de ${role}.` };
  } catch (error) {
    console.error("Erro ao definir custom claim:", error);
    throw new functions.https.HttpsError("internal", "Ocorreu um erro interno ao tentar definir a função do usuário.");
  }
});
*/
