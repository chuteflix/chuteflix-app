"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthProvider } from '@/context/auth-context';
import { PublicHeader } from '@/components/public-header';
import { LayoutClient } from '@/app/(main)/layout-client';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {/* O PublicHeader é renderizado no layout raiz agora */}
        <LayoutClient>{children}</LayoutClient>
      </div>
    </AuthProvider>
  );
}