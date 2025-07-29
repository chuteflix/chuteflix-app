import * as admin from 'firebase-admin';

// The correct, one-line syntax proven to work in your other files.
const privateKey = process.env.FB_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Ensure all essential credentials are present.
if (!process.env.FB_ADMIN_PROJECT_ID || !privateKey || !process.env.FB_ADMIN_CLIENT_EMAIL) {
  throw new Error("Firebase Admin SDK environment variables (PROJECT_ID, PRIVATE_KEY, CLIENT_EMAIL) are not configured correctly.");
}

// Initialize Firebase Admin SDK only if no apps are initialized.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FB_ADMIN_PROJECT_ID,
      clientEmail: process.env.FB_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const db = admin.firestore();
const auth = admin.auth();

// Export the ready-to-use instances.
export { db, auth, admin };
