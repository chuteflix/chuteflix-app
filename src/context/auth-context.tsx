
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '@/services/users'; // Usar a interface UserProfile que já tem a 'role'

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  userRole: string | null; // Adicionar userRole
  loading: boolean;
  balance: number | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  userRole: null, // Valor inicial
  loading: true,
  balance: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // Estado para a role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // Força a atualização do token para pegar as custom claims mais recentes
        const idTokenResult = await firebaseUser.getIdTokenResult(true);
        const role = idTokenResult.claims.role as string || null;
        setUserRole(role);

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserProfile({ uid: doc.id, ...doc.data() } as UserProfile);
          } else {
            setUserProfile(null);
          }
          setUser(firebaseUser);
          setLoading(false);
        });
        return unsubscribeFirestore; // Retorna o listener do firestore
      } else {
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const balance = userProfile?.balance ?? null; // Usar ?? para lidar com 0
  const value = { user, userProfile, userRole, loading, balance };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
