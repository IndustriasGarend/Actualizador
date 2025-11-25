'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Computer,
  Settings,
  History,
  Rocket,
  LifeBuoy,
  Package,
} from 'lucide-react';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export function MainSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Panel', icon: Computer },
    { href: '/paquetes', label: 'Paquetes', icon: Package },
    { href: '/historial', label: 'Historial', icon: History },
    { href: '/configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <>
      <SidebarHeader className="p-0">
        <div className="flex items-center gap-3 p-4">
          <Rocket className="h-8 w-8 text-sidebar-foreground" />
          <h1 className="text-xl font-semibold text-sidebar-foreground whitespace-nowrap">
            Clic Actualizador
          </h1>
        </div>
      </SidebarHeader>
      <Separator className="bg-sidebar-border" />
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                tooltip={item.label}
              >
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
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/ayuda')}
                tooltip="Ayuda"
              >
                <Link href="/ayuda">
                  <LifeBuoy />
                  <span>Ayuda</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
         <Separator className="bg-sidebar-border" />
        <div className="p-4">
            <p className="text-xs text-sidebar-foreground/70 text-center">© 2024</p>
        </div>
      </SidebarFooter>
    </>
  );
}
