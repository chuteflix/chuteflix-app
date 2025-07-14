
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions"; // Importar

// TODO: Add your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEx-hnuee9Wczxrwx7kyh8q3LyjOgNPLY",
  authDomain: "chuteflix-bolo-app.firebaseapp.com",
  projectId: "chuteflix-bolo-app",
  storageBucket: "chuteflix-bolo-app.appspot.com",
  messagingSenderId: "1007906207909",
  appId: "1:1007906207909:web:cbdacde4b8c07a8874f54c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app); // Inicializar

export { app, auth, db, storage, functions }; // Exportar
