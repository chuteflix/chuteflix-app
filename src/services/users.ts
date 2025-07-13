
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  cpf?: string
  phone?: string
  pixKey?: string
  pixKeyType?: string
  isAdmin?: boolean
}

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersCollectionRef = collection(db, "users")
    const querySnapshot = await getDocs(usersCollectionRef)
    const users: UserProfile[] = []
    querySnapshot.forEach(doc => {
      users.push({ uid: doc.id, ...doc.data() } as UserProfile)
    })
    return users
  } catch (error) {
    console.error("Error getting all users:", error)
    return []
  }
}

export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, "users", uid)
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      return { uid, ...userDocSnap.data() } as UserProfile
    } else {
      console.log("No such document!")
      return null
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", uid)
    await updateDoc(userDocRef, data)
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

export const createUserProfile = async (user: UserProfile): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", user.uid)
    await setDoc(userDocRef, user)
  } catch (error) {
    console.error("Error creating user profile: ", error)
    throw error
  }
}
