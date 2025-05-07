
import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, MessageSquare, Bell, User } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

interface NavigationItem {
  icon: React.ElementType;
  label: string;
  path: string;
  active: boolean;
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
  
  const navigationItems: NavigationItem[] = [
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
      <div className="min-h-screen flex flex-col w-full bg-background">
        {showHeader && <Header />}
        
        <div className="flex flex-row w-full flex-1">
          <Sidebar>
            <SidebarContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.path} className={item.active ? "bg-accent" : ""}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                    >
                      {<item.icon className="h-5 w-5 mr-2" />}
                      {item.label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          
          <main className="flex-grow flex flex-col w-full max-w-2xl mx-auto">
            {children}
          </main>
        </div>
        
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
};

export default PageLayout;
