
const admin = require('firebase-admin');

// Carrega as credenciais da conta de serviço
const serviceAccount = require('./functions/serviceAccountKey.json.json');

// Inicializa o app Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = process.argv[2];

if (!uid) {
  console.error('Erro: UID do usuário não fornecido.');
  console.log('Modo de uso: node set-first-admin.js <UID_DO_USUARIO>');
  process.exit(1);
}

const db = admin.firestore();

async function setAdmin(targetUid) {
  try {
    console.log(`Iniciando processo para tornar ${targetUid} um administrador...`);
    
    // Define a custom claim 'role' como 'admin'
    await admin.auth().setCustomUserClaims(targetUid, { role: 'admin' });
    
    // Atualiza o documento do usuário no Firestore para consistência
    const userRef = db.collection('users').doc(targetUid);
    await userRef.set({ role: 'admin' }, { merge: true });

    console.log('----------------------------------------------------');
    console.log('SUCESSO!');
    console.log(`O usuário com UID ${targetUid} foi promovido a administrador.`);
    console.log('IMPORTANTE: É necessário fazer logout e login novamente no app para aplicar as novas permissões.');
    console.log('----------------------------------------------------');
    
  } catch (error) {
    console.error('ERRO: Não foi possível definir a permissão de administrador.');
    console.error(error.message);
  }
}

setAdmin(uid).then(() => process.exit(0));
