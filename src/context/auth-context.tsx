
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { UserProfile } from '@/types'; 
import { getSettings } from '@/services/settings';
import { Settings } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  settings: Settings | null;
  userRole: string | null;
  loading: boolean;
  balance: number | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  settings: null,
  userRole: null,
  loading: true,
  balance: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Listener para as configurações do aplicativo
  useEffect(() => {
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'app'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as Settings);
      } else {
        console.warn("Documento de configurações do app não encontrado!");
        setSettings(null);
      }
    }, (error) => {
      console.error("Erro ao buscar configurações do app:", error);
      setSettings(null);
    });

    return () => unsubscribeSettings();
  }, []);
  
  // Listener para o estado de autenticação do usuário
  useEffect(() => {
    let unsubscribeFirestore: Unsubscribe | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }

      if (firebaseUser) {
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult(true);
          const role = idTokenResult.claims.role as string | null;
          
          setUser(firebaseUser);
          setUserRole(role);

          const userDocRef = doc(db, 'users', firebaseUser.uid);
          unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
            setUserProfile(doc.exists() ? { uid: doc.id, ...doc.data() } as UserProfile : null);
            setLoading(false);
          }, (error) => {
              console.error("Erro ao buscar perfil do usuário:", error);
              setUserProfile(null);
              setLoading(false);
          });

        } catch (error) {
          console.error("Erro ao buscar token do usuário:", error);
          setUser(firebaseUser);
          setUserProfile(null);
          setUserRole(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  const balance = userProfile?.balance ?? null;
  // Agora as configurações também fazem parte do contexto
  const value = { user, userProfile, settings, userRole, loading, balance };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
