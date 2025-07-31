
"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/sidebar";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Loader2 } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // This part should ideally not be hit if routing is correct,
    // as public pages have their own layout. But as a fallback:
    return <>{children}</>;
  }
  
  const isAdminSection = pathname.startsWith('/admin');
  const displayRole = (user.role === 'admin' && isAdminSection) ? 'admin' : 'user';

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role={displayRole} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-20 pb-16 md:pb-8">
          {children}
        </main>
        <BottomTabBar />
      </div>
    </div>
  );
}
