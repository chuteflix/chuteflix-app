
"use client";

import { AuthProvider, useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/sidebar";
import { PublicHeader } from "@/components/public-header";
import { Settings } from "@/types";
import { usePathname } from 'next/navigation';
import { Loader2 } from "lucide-react";

// Layout para páginas públicas (homepage, etc.)
function PublicLayout({ children, settings }: { children: React.ReactNode; settings: Settings | null; }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader settings={settings} />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}

// Layout para páginas de painel (admin e usuário)
function DashboardLayout({ children }: { children: React.ReactNode; }) {
  const { userRole, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Lógica para decidir qual menu exibir.
  // Mostra o menu de admin apenas se a rota for de admin E o usuário for admin.
  const isAdminSection = pathname.startsWith('/admin');
  const displayRole = (userRole === 'admin' && isAdminSection) ? 'admin' : 'user';

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role={displayRole} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Componente "roteador" que decide qual layout renderizar.
function AppLayoutRouter({ children, settings }: { children: React.ReactNode; settings: Settings | null; }) {
    const pathname = usePathname();
    const { loading } = useAuth();

    const dashboardRoutes = [
        '/admin', '/inicio', '/meus-chutes', '/profile', 
        '/recarga', '/saque', '/transacoes', '/settings'
    ];

    const isDashboardRoute = dashboardRoutes.some(route => pathname.startsWith(route));

    // Loader para evitar o "flash" do layout incorreto durante a verificação de auth.
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (isDashboardRoute) {
        return <DashboardLayout>{children}</DashboardLayout>;
    }

    return <PublicLayout settings={settings}>{children}</PublicLayout>;
}

// Componente final que envolve tudo no provedor de autenticação.
export function LayoutClient({ children, settings }: { children: React.ReactNode; settings: Settings | null; }) {
  return (
    <AuthProvider>
      <AppLayoutRouter settings={settings}>
        {children}
      </AppLayoutRouter>
    </AuthProvider>
  );
}
