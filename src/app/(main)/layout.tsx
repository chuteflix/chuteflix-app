
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
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
  User as UserIcon,
  Home,
  KeyRound,
  TicketCheck,
  Wallet,
  DollarSign,
  Banknote, // Ícone para depósitos
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
import { WelcomeBanner } from '@/components/welcome-banner';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, balance } = useAuth();
  const [userFullName, setUserFullName] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
        if (user.displayName) {
            setUserFullName(user.displayName);
        } else {
            const storedName = localStorage.getItem('userFullName');
            if (storedName) {
                setUserFullName(storedName);
            }
        }
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userFullName');
    router.push('/login');
  };

  const userMenuItems = [
    { href: '/inicio', label: 'Início', icon: Home, exact: true },
    { href: '/meus-chutes', label: 'Meus Chutes', icon: History },
    { href: '/recarga', label: 'Recarregar', icon: DollarSign },
    { href: '/transacoes', label: 'Minhas Transações', icon: ArrowRightLeft },
    { href: '/settings', label: 'Chave PIX', icon: KeyRound },
  ];

  const adminMenuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutGrid, exact: true },
    { href: '/admin/boloes', label: 'Bolões', icon: Shield },
    { href: '/admin/chutes', label: 'Chutes', icon: TicketCheck },
    { href: '/admin/depositos', label: 'Depósitos', icon: Banknote }, // Novo item de menu
    { href: '/admin/campeonatos', label: 'Campeonatos', icon: Trophy },
    { href: '/admin/times', label: 'Times', icon: Flag },
    { href: '/admin/usuarios', label: 'Usuários', icon: UsersIcon },
    { href: '/admin/transacoes', label: 'Transações', icon: ArrowRightLeft },
    { href: '/admin/notificacoes', label: 'Notificações', icon: Bell },
    { href: '/admin/configuracoes', label: 'Configurações', icon: SettingsIcon },
  ];
  
  const isAdminPage = pathname.startsWith('/admin');
  const menuItems = isAdminPage ? adminMenuItems : userMenuItems;

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };
  
  const getHeaderTitle = () => {
    const activeItem = menuItems.find(item => isActive(item.href, item.exact));
    return activeItem?.label || 'ChuteFlix';
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SidebarProvider>
        <ToastProvider>
          <Sidebar>
            <SidebarHeader><Logo /></SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.href, item.exact)} 
                      tooltip={item.label}
                      className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-muted"
                    >
                      <Link href={item.href}><item.icon className="h-5 w-5" /><span>{item.label}</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden text-muted-foreground hover:text-foreground"><Menu /></SidebarTrigger>
                <h2 className="text-xl font-semibold hidden sm:block">{getHeaderTitle()}</h2>
              </div>
              <div className="flex items-center gap-4">
                {balance !== null && !isAdminPage && (
                    <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                            {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                )}
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted"><Bell className="h-5 w-5" /></Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-muted">
                      <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-card border-border text-foreground" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userFullName || 'Usuário'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem asChild className="hover:bg-muted focus:bg-muted">
                      <Link href="/profile"><UserIcon className="mr-2 h-4 w-4" /><span>Editar Perfil</span></Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-secondary hover:bg-secondary/10 hover:text-secondary focus:bg-secondary/10 focus:text-secondary">
                      <LogOut className="mr-2 h-4 w-4" /><span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/20">{children}</main>
          </SidebarInset>
        </ToastProvider>
      </SidebarProvider>
    </div>
  );
}
