"use client";

import { AuthProvider, useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/sidebar";
import { PublicHeader } from "@/components/public-header";
import { usePathname } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { BottomTabBar } from "@/components/bottom-tab-bar";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader showNavLinks={true} />
      <main className="flex-grow">{children}</main>
    </div>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userRole } = useAuth();
  const pathname = usePathname();
  const isAdminSection = pathname.startsWith('/admin');
  const displayRole = (userRole === 'admin' && isAdminSection) ? 'admin' : 'user';

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role={displayRole} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <PublicHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 pb-16 md:pb-8"> 
          {children}
        </main>
        <BottomTabBar />
      </div>
    </div>
  );
}

function AppLayoutRouter({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { loading, user } = useAuth();

    const authRoutes = ['/login', '/register'];

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (authRoutes.includes(pathname)) {
        return <>{children}</>;
    }
    
    if (!user) {
        return <PublicLayout>{children}</PublicLayout>;
    }

    return <DashboardLayout>{children}</DashboardLayout>;
}

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayoutRouter>{children}</AppLayoutRouter>
    </AuthProvider>
  );
}
