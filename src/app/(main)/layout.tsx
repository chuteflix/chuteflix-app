"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  Bell,
  Menu,
  Shield,
  Trophy,
  Flag,
  Users as UsersIcon,
  ArrowRightLeft,
  LayoutGrid,
  History,
  User as UserIcon
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { ToastProvider } from '@/components/toast-provider';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { WelcomeBanner } from '@/components/welcome-banner';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('userFirstName');
    router.push('/login');
  };

  const userMenuItems = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/dashboard', label: 'Meus Chutes', icon: LayoutDashboard },
    { href: '/history', label: 'Histórico', icon: History },
    { href: '/settings', label: 'Configurações', icon: SettingsIcon },
  ];

  const adminMenuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutGrid },
    { href: '/admin?tab=boloes', label: 'Bolões', icon: Shield },
    { href: '/admin?tab=campeonatos', label: 'Campeonatos', icon: Trophy },
    { href: '/admin?tab=times', label: 'Times', icon: Flag },
    { href: '/admin?tab=usuarios', label: 'Usuários', icon: UsersIcon },
    { href: '/admin?tab=transacoes', label: 'Transações', icon: ArrowRightLeft },
    { href: '/admin?tab=configuracoes', label: 'Configurações', icon: SettingsIcon },
  ];
  
  const isAdminPage = pathname.startsWith('/admin');
  const menuItems = isAdminPage ? adminMenuItems : userMenuItems;

  const isActive = (href: string) => {
    return pathname === href;
  };
  
  const getHeaderTitle = () => {
    if (isAdminPage) {
      return "Painel do Administrador";
    }
    return menuItems.find(item => item.href === pathname)?.label || 'ChuteFlix';
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ToastProvider>
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                   <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden">
                <Menu />
              </SidebarTrigger>
              <h2 className="text-xl font-semibold hidden sm:block">
                {getHeaderTitle()}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <WelcomeBanner />
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || "https://placehold.co/100x100.png"} alt={user.displayName || ""} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || "Usuário"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Editar Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </ToastProvider>
    </SidebarProvider>
  );
}
