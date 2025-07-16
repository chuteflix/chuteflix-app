"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { User as AppUser } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: AppUser | null;
  loading: boolean;
  balance: number | null;
  pixKey?: string;
  pixKeyType?: string;
}

const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, loading: true, balance: null });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Se o usuário estiver logado, busca o perfil dele.
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserProfile({ id: doc.id, ...doc.data() } as AppUser);
          } else {
            setUserProfile(null);
          }
          setUser(firebaseUser);
          // Só para de carregar DEPOIS de verificar o usuário e buscar o perfil.
          setLoading(false); 
        });
        return unsubscribeFirestore;
      } else {
        // Se não houver usuário, encerra o carregamento.
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const balance = userProfile?.balance || null;
  const pixKey = userProfile?.pixKey;
  const pixKeyType = userProfile?.pixKeyType;

  const value = { user, userProfile, loading, balance, pixKey, pixKeyType };

  return (
    <AuthContext.Provider value={value}>
      {/* Garante que o app só será renderizado após o fim do carregamento */}
      {!loading ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
