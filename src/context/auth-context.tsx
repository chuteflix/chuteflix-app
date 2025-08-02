"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile, Settings } from '@/types';
import { getSettings } from '@/services/settings';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userRole: 'admin' | 'user' | null;
  loading: boolean;
  settings: Settings | null; // Adicionando settings ao contexto
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega as configurações do aplicativo uma vez
    const fetchAppSettings = async () => {
        try {
            const appSettings = await getSettings();
            setSettings(appSettings);
        } catch (error) {
            console.error("Erro ao buscar configurações globais do app:", error);
        }
    };

    fetchAppSettings();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Se o usuário estiver logado, ouve as atualizações do perfil em tempo real
        const userDocRef = doc(db, 'users', user.uid);
        const unsubProfile = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data() as UserProfile;
            setUserProfile(data);
            setUserRole(data.role || 'user');
          } else {
            setUserProfile(null);
            setUserRole(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
          setUserRole(null);
          setLoading(false);
        });
        return () => unsubProfile();
      } else {
        // Se não houver usuário, para de carregar
        setUserProfile(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = { user, userProfile, userRole, settings, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
