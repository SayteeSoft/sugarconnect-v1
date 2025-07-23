
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Settings, User, Search as SearchIcon } from "lucide-react";
import { Logo } from "./logo";

const currentUser = {
  name: "Alex",
  image: "https://placehold.co/100x100.png",
  email: "alex.doe@example.com",
};

export function DashboardSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/search", label: "Search", icon: SearchIcon },
    { href: "/dashboard/profile", label: "My Profile", icon: User },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <Logo inSidebar />
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={{ children: item.label, side: "right", align: "center" }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )})}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-sidebar-accent">
            <Avatar className="h-9 w-9">
              <AvatarImage src={currentUser.image} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden text-sm">
              <span className="truncate font-medium text-sidebar-foreground">{currentUser.name}</span>
              <span className="truncate text-sidebar-foreground/70">{currentUser.email}</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
