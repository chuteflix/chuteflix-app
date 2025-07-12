"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  LayoutGrid
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

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const userMenuItems = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/dashboard', label: 'Meus Chutes', icon: LayoutDashboard },
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
     if (href.includes('?tab=')) {
        // This is a rough check. For a more robust solution, you might need to parse query params.
        // For now, it will highlight the main /admin link and the specific tab link.
        return pathname === href.split('?')[0] && window.location.search.includes(href.split('?')[1]);
     }
     return pathname === href;
  };
  
  const getHeaderTitle = () => {
    if (isAdminPage) {
      // Logic to find title for admin pages with tabs might be needed here
      return "Painel do Administrador";
    }
    return menuItems.find(item => item.href === pathname)?.label || 'ChuteFlix';
  }


  return (
    <SidebarProvider>
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
        <SidebarFooter>
           <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Configurações">
                  <Link href="/admin?tab=configuracoes">
                    <SettingsIcon />
                    <span>Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
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
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="male person" />
                    <AvatarFallback>AU</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Usuário</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      usuario@chuteflix.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
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
    </SidebarProvider>
  );
}
