import * as admin from 'firebase-admin';

const projectId = process.env.FB_ADMIN_PROJECT_ID;
const privateKey = process.env.FB_ADMIN_PRIVATE_KEY?.replace(/
/g, '
');
const clientEmail = process.env.FB_ADMIN_CLIENT_EMAIL;

if (!projectId || !privateKey || !clientEmail) {
  throw new Error("Missing Firebase Admin SDK credentials.");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
