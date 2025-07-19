
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImage } from "@/lib/cloudinary"; // CORRIGIDO: Importa do novo serviço Cloudinary

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  cpf?: string;
  phone?: string;
  pixKey?: string;
  pixKeyType?: string;
  isAdmin?: boolean;
  balance?: number;
  photoURL?: string;
  role?: string;
}

// CORRIGIDO: Função agora usa 'uploadImage' do Cloudinary
export const uploadProfilePicture = async (uid: string, file: File): Promise<string> => {
  try {
    if (!uid) throw new Error("UID do usuário é necessário para o upload.");
    if (!file) throw new Error("Nenhum arquivo selecionado.");

    // O serviço do Cloudinary não precisa de um 'path' da mesma forma, ele gerencia isso.
    // Podemos adicionar um 'public_id' ou 'folder' se quisermos organizar, o que já foi feito em 'uploadImage'.
    const photoURL = await uploadImage(file);

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
    const users: UserProfile[] = [];
    querySnapshot.forEach(doc => {
      users.push({ uid: doc.id, ...doc.data() } as UserProfile);
    });
    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
};

export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return { uid, ...userDocSnap.data() } as UserProfile;
    } else {
      console.log("No such document!");
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
