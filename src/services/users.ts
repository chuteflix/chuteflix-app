
import { db } from "@/lib/firebase"
import { collection, doc, getDocs, updateDoc } from "firebase/firestore"

export interface User {
  id: string
  name?: string
  email?: string
  isAdmin?: boolean
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"))
    return querySnapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        } as User)
    )
  } catch (error) {
    console.error("Erro ao buscar usuários: ", error)
    throw new Error("Não foi possível buscar os usuários.")
  }
}

export const setUserAdminStatus = async (
  uid: string,
  isAdmin: boolean
): Promise<void> => {
  if (!uid) {
    throw new Error("UID do usuário é obrigatório.")
  }

  try {
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, {
      isAdmin: isAdmin,
    })
  } catch (error) {
    console.error("Erro ao atualizar status de admin: ", error)
    throw new Error("Não foi possível atualizar o status de admin do usuário.")
  }
}
