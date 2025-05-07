
import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, MessageSquare, Bell, User } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showHeader = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navigationItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      active: isActive("/")
    },
    {
      icon: Map,
      label: "Map",
      path: "/map",
      active: isActive("/map")
    },
    {
      icon: MessageSquare,
      label: "Chats",
      path: "/chats",
      active: isActive("/chats")
    },
    {
      icon: Bell,
      label: "Notifications",
      path: "/notifications",
      active: isActive("/notifications")
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
      active: isActive("/profile")
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-background overflow-hidden">
        {showHeader && <Header />}
        
        <div className="flex flex-row w-full flex-1">
          {/* Left Sidebar for Desktop Navigation - Always shown on desktop */}
          <Sidebar className="border-r hidden md:flex h-[calc(100vh-64px)] sticky top-16">
            <SidebarContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      className={item.active ? "bg-accent text-accent-foreground" : ""}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          
          {/* Main content - adjusted to give more space on desktop */}
          <div className="flex-grow flex flex-col overflow-auto pb-16 md:pb-0 w-full">
            {children}
          </div>
        </div>
        
        {/* Bottom navigation for mobile only */}
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
};

export default PageLayout;
