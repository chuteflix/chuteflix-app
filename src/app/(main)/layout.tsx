
import React from 'react';
import { MainLayoutClient } from './layout-client'; // Importa o novo componente de cliente

export default function MainLayout({ children }: { children: React.ReactNode }) {
  // Este é um Server Component. A lógica foi movida.
  return (
    <MainLayoutClient>
      {children}
    </MainLayoutClient>
  );
}
