
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { UserProfile } from '@/services/users'; 

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  userRole: string | null;
  loading: boolean;
  balance: number | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  userRole: null,
  loading: true,
  balance: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeFirestore: Unsubscribe | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Garante que o estado seja de carregamento ao reavaliar
      
      if (unsubscribeFirestore) {
        unsubscribeFirestore(); // Cancela o listener anterior para evitar leaks
      }

      if (firebaseUser) {
        try {
          // Força a atualização do token para garantir que as custom claims (role) estão atualizadas
          const idTokenResult = await firebaseUser.getIdTokenResult(true);
          const role = idTokenResult.claims.role as string | null;
          
          setUser(firebaseUser); // Define o usuário base do Firebase
          setUserRole(role); // Define a permissão (role)

          // Se for um usuário, busca o perfil no Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              setUserProfile({ uid: doc.id, ...doc.data() } as UserProfile);
            } else {
              setUserProfile(null); // Usuário autenticado mas sem perfil no DB
            }
            setLoading(false); // Finaliza o carregamento após buscar o perfil
          }, (error) => {
              console.error("Erro ao buscar perfil do usuário no Firestore:", error);
              setUserProfile(null);
              setLoading(false); // Finaliza mesmo em caso de erro
          });

        } catch (error) {
          console.error("Erro ao buscar token ou permissão do usuário:", error);
          setUser(firebaseUser); // Mantém o usuário base
          setUserProfile(null);
          setUserRole(null);
          setLoading(false); // Finaliza o carregamento em caso de erro de token/role
        }
      } else {
        // Nenhum usuário logado
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
        setLoading(false); // Finaliza o carregamento
      }
    });

    // Função de limpeza para desmontar os listeners quando o componente for destruído
    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  const balance = userProfile?.balance ?? null;
  const value = { user, userProfile, userRole, loading, balance };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
