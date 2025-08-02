"use client";

import { usePathname } from 'next/navigation';
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, userRole } = useAuth();
  const pathname = usePathname();
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }
  
  const isAdminSection = pathname.startsWith('/admin');
  const displayRole = (userRole === 'admin' && isAdminSection) ? 'admin' : 'user';

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-20 pb-16 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
