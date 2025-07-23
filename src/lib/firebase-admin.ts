import * as admin from 'firebase-admin';

// Use os nomes corretos das variáveis de ambiente
const projectId = process.env.FB_ADMIN_PROJECT_ID;
const privateKey = process.env.FB_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FB_ADMIN_CLIENT_EMAIL;

// Verifica se as variáveis de ambiente essenciais estão presentes
if (!projectId || !privateKey || !clientEmail) {
  console.error("As variáveis de ambiente do Firebase para o Admin SDK não estão completamente configuradas.");
  // Lança um erro para interromper a execução se as chaves não estiverem presentes
  throw new Error("Configuração do servidor Firebase incompleta. Verifique as variáveis de ambiente do Admin SDK.");
}

// Inicializa o Firebase Admin SDK somente se não houver apps inicializados
// Isso evita erros de "already initialized" em ambientes de desenvolvimento com hot-reload
if (!admin.apps.length) {
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
    console.error("Erro ao inicializar o Firebase Admin SDK:", error);
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
