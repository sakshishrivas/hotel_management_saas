'use client';

import {
  Building,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  CalendarCheck,
  CalendarDays,
  Sparkles,
  BarChart,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { authApi } from '@/features/auth/api/auth.api';

const mainNavItems = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { title: 'Bookings', icon: CalendarDays, href: '/bookings' },
  { title: 'Customers', icon: Users, href: '/customers' },
  { title: 'Reports', icon: BarChart, href: '/reports' },
];

const operationsNavItems = [
  { title: 'Check-In/Out', icon: CalendarCheck, href: '/front-desk' },
  { title: 'Housekeeping', icon: Sparkles, href: '/housekeeping' },
  { title: 'Rooms', icon: Home, href: '/rooms' },
];

const financeNavItems = [
  { title: 'Invoices', icon: FileText, href: '/invoices' },
  { title: 'Payments', icon: CreditCard, href: '/payments' },
];

export function AppSidebar() {
  const pathname = usePathname();
  
  const handleLogout = async () => {
    await authApi.logout();
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Building className="h-6 w-6" />
          <span className="truncate">Hotel SaaS</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={pathname === item.href} render={<Link href={item.href} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={pathname === item.href || pathname.startsWith(item.href)} render={<Link href={item.href} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Finance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {financeNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={pathname === item.href || pathname.startsWith(item.href)} render={<Link href={item.href} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
