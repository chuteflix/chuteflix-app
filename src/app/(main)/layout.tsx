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

  const isActive = (href: string) => pathname === href;
  
  const getHeaderTitle = () => {
    if (isAdminPage) return "Painel do Administrador";
    return menuItems.find(item => item.href === pathname)?.label || 'ChuteFlix';
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-black text-gray-50 min-h-screen">
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
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.href)} 
                      tooltip={item.label}
                      className="data-[active=true]:bg-green-500/10 data-[active=true]:text-green-400 hover:bg-gray-800"
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-black/80 backdrop-blur-sm z-10">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden text-gray-400 hover:text-white">
                  <Menu />
                </SidebarTrigger>
                <h2 className="text-xl font-semibold hidden sm:block">
                  {getHeaderTitle()}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <WelcomeBanner />
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                  <Bell className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-gray-800">
                      <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-green-500">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800 text-gray-50" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || "Usuário"}</p>
                        <p className="text-xs leading-none text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem asChild className="hover:bg-gray-800 focus:bg-gray-800">
                      <Link href="/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Editar Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-950">
              {children}
            </main>
          </SidebarInset>
        </ToastProvider>
      </SidebarProvider>
    </div>
  );
}
