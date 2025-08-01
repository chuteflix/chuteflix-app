
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  increment,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadFileToApi } from "./upload";
import { UserProfile } from "@/types"; // Importação do tipo centralizado

// Helper para converter dados do Firestore para UserProfile de forma segura
export const fromFirestore = (doc: DocumentData): UserProfile => {
  const data = doc.data();
  const name = data.name || data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim();
  return {
    uid: doc.id,
    email: data.email || "",
    name: name,
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    displayName: name,
    photoURL: data.photoURL || "",
    balance: data.balance || 0,
    isAdmin: data.isAdmin || false,
    createdAt: data.createdAt, // Mantém o timestamp
    phone: data.phone || "",
    cpf: data.cpf || "",
    pixKey: data.pixKey || "",
    pixKeyType: data.pixKeyType || "",
    role: data.role || "user",
  };
};

export const uploadProfilePicture = async (uid: string, file: File): Promise<string> => {
  try {
    if (!uid) throw new Error("UID do usuário é necessário para o upload.");
    if (!file) throw new Error("Nenhum arquivo selecionado.");

    const photoURL = await uploadFileToApi(file);

    await updateUserProfile(uid, { photoURL });
    
    return photoURL;
  } catch (error) {
    console.error("Erro ao fazer upload da foto de perfil:", error);
    throw new Error("Não foi possível fazer o upload da imagem.");
  }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersCollectionRef = collection(db, "users");
    const querySnapshot = await getDocs(usersCollectionRef);
    return querySnapshot.docs.map(fromFirestore);
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
};

export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  try {
    if(!uid) return null;
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // Usa a função fromFirestore para consistência
      return fromFirestore(userDocSnap);
    } else {
      console.log("No such document for user:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, data);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const createUserProfile = async (user: UserProfile): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, user);
  } catch (error) {
    console.error("Error creating user profile: ", error);
    throw error;
  }
};

export const updateUserBalance = async (uid: string, amount: number): Promise<void> => {
    try {
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, {
            balance: increment(amount)
        });
    } catch (error) {
        console.error("Error updating user balance:", error);
        throw new Error("Failed to update user balance.");
    }
}
