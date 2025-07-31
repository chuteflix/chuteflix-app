
"use client";

import { AuthProvider, useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/sidebar";
import { usePathname } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { DashboardHeader } from "@/components/dashboard-header";
import { PublicHeader } from "@/components/public-header";

function AppLayoutRouter({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { loading, user, settings } = useAuth();

    const authRoutes = ['/login', '/register'];

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    // Auth routes have their own layout (no header/sidebar)
    if (authRoutes.includes(pathname)) {
        return <>{children}</>;
    }
    
    // If there is no user, it must be a public page, so no dashboard layout.
    // The public header is handled by the root layout.
    if (!user) {
        return <>{children}</>;
    }

    // If the user is logged in, show the dashboard layout
    const isAdminSection = pathname.startsWith('/admin');
    const displayRole = (user.role === 'admin' && isAdminSection) ? 'admin' : 'user';

    return (
      <div className="flex h-screen bg-background">
        <Sidebar role={displayRole} />
        <div className="flex flex-1 flex-col overflow-hidden"> 
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-24 pb-16 md:pb-8"> 
            {children}
          </main>
          <BottomTabBar />
        </div>
      </div>
    );
}

export function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayoutRouter>{children}</AppLayoutRouter>
    </AuthProvider>
  );
}
