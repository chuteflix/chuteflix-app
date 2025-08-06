"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, Settings } from "@/types";

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  settings: Settings | null; // Usar a interface Settings do types/index.ts
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  settings: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null); // Usar a interface Settings
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Listener para o perfil do usuário
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserProfile({ uid: doc.id, ...doc.data() } as User);
          } else {
            setUserProfile(null);
          }
        });

        // Fetch de configurações
        try {
          const settingsDocRef = doc(db, "settings", "app");
          const settingsDoc = await getDoc(settingsDocRef);
          if (settingsDoc.exists()) {
            setSettings(settingsDoc.data() as Settings); // Usar a interface Settings
          }
        } catch (error) {
          console.error("Erro ao carregar configurações:", error);
        } finally {
          setLoading(false);
        }

        return () => {
          unsubscribeProfile();
        };
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, settings, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
