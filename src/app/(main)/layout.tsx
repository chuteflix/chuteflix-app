
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  Banknote,
  Send,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck, // Ícone para a equipe
} from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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

const SidebarComponent = ({ menuItems, isUserSidebarCollapsed, setIsUserSidebarCollapsed, isAdminPage, pathname, isActive, handleLogout, user, userProfile, isMobileSidebarOpen, setIsMobileSidebarOpen }) => (
  <>
    <div className={cn('hidden md:flex flex-col transition-all duration-300 ease-in-out', isUserSidebarCollapsed ? 'w-20' : 'w-64', isAdminPage ? 'w-64' : '')}>
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
                  isActive={isActive(item.href, item.exact)} 
                  tooltip={isUserSidebarCollapsed ? item.label : undefined}
                  className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-muted"
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    {!isUserSidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        {!isAdminPage && (
          <SidebarFooter>
            <SidebarMenuButton 
                onClick={() => setIsUserSidebarCollapsed(!isUserSidebarCollapsed)}
                className="hover:bg-muted"
            >
              {isUserSidebarCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
              {!isUserSidebarCollapsed && <span>Recolher</span>}
            </SidebarMenuButton>
          </SidebarFooter>
        )}
      </Sidebar>
    </div>
    <div className='md:hidden'>
    <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
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
                    isActive={isActive(item.href, item.exact)} 
                    className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-muted"
                    onClick={() => setIsMobileSidebarOpen(false)}
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
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-muted">
                  <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary">
                    <AvatarImage src={userProfile.photoURL || ""} alt={userProfile.name || ""} />
                    <AvatarFallback>{userProfile.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-border text-foreground" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile.name || 'Usuário'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild className="hover:bg-muted focus:bg-muted" onClick={() => setIsMobileSidebarOpen(false)}>
                  <Link href="/profile"><UserIcon className="mr-2 h-4 w-4" /><span>Editar Perfil</span></Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { handleLogout(); setIsMobileSidebarOpen(false); }} className="text-secondary hover:bg-secondary/10 hover:text-secondary focus:bg-secondary/10 focus:text-secondary">
                  <LogOut className="mr-2 h-4 w-4" /><span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
      </SheetContent>
    </Sheet>
    </div>
  </>
);


export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUserSidebarCollapsed, setIsUserSidebarCollapsed] = useState(false);
  
  const isAdminPage = useMemo(() => pathname.startsWith('/admin'), [pathname]);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };
  
  const userMenuItems = [
    { href: '/inicio', label: 'Início', icon: Home, exact: true },
    { href: '/meus-chutes', label: 'Meus Chutes', icon: History },
    { href: '/recarga', label: 'Recarregar', icon: DollarSign },
    { href: '/saque', label: 'Sacar', icon: Send },
    { href: '/transacoes', label: 'Minhas Transações', icon: ArrowRightLeft },
    { href: '/settings', label: 'Chave PIX', icon: KeyRound },
  ];

  const adminMenuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutGrid, exact: true },
    { href: '/admin/boloes', label: 'Bolões', icon: Shield },
    { href: '/admin/chutes', label: 'Chutes', icon: TicketCheck },
    { href: '/admin/depositos', label: 'Depósitos', icon: Banknote },
    { href: '/admin/saques', label: 'Saques', icon: Send },
    { href: '/admin/campeonatos', label: 'Campeonatos', icon: Trophy },
    { href: '/admin/times', label: 'Times', icon: Flag },
    { href: '/admin/usuarios', label: 'Usuários', icon: UsersIcon },
    { href: '/admin/equipe', label: 'Equipe', icon: ShieldCheck }, // <-- ITEM ADICIONADO AQUI
    { href: '/admin/transacoes', label: 'Transações', icon: ArrowRightLeft },
    { href: '/admin/notificacoes', label: 'Notificações', icon: Bell },
    { href: '/admin/configuracoes', label: 'Configurações', icon: SettingsIcon },
  ];

  const menuItems = isAdminPage ? adminMenuItems : userMenuItems;

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };
  
  const getHeaderTitle = () => {
    const activeItem = menuItems.find(item => isActive(item.href, item.exact));
    return activeItem?.label || 'ChuteFlix';
  }

  if (loading || !userProfile) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-background text-foreground min-h-screen flex">
      <ToastProvider>
        <SidebarComponent 
          menuItems={menuItems} 
          isUserSidebarCollapsed={isUserSidebarCollapsed} 
          setIsUserSidebarCollapsed={setIsUserSidebarCollapsed} 
          isAdminPage={isAdminPage} 
          pathname={pathname} 
          isActive={isActive} 
          handleLogout={handleLogout} 
          user={user} 
          userProfile={userProfile} 
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold hidden sm:block">{getHeaderTitle()}</h2>
            </div>
            <div className="flex items-center gap-4">
               {userProfile.balance !== null && !isAdminPage && (
                  <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <span className="text-sm font-semibold text-foreground">
                          {userProfile.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                  </div>
              )}
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted"><Bell className="h-5 w-5" /></Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-muted">
                    <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary">
                      <AvatarImage src={userProfile.photoURL || ""} alt={userProfile.name || ""} />
                      <AvatarFallback>{userProfile.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border-border text-foreground" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile.name || 'Usuário'}</p>
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
        </div>
      </ToastProvider>
    </div>
  );
}
