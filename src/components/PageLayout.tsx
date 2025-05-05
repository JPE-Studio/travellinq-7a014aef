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
  const {
    user
  } = useAuth();
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  const navigationItems = [{
    icon: Home,
    label: "Home",
    path: "/",
    active: isActive("/")
  }, {
    icon: Map,
    label: "Map",
    path: "/map",
    active: isActive("/map")
  }, {
    icon: MessageSquare,
    label: "Chats",
    path: "/chats",
    active: isActive("/chats")
  }, {
    icon: Bell,
    label: "Notifications",
    path: "/notifications",
    active: isActive("/notifications")
  }, {
    icon: User,
    label: "Profile",
    path: "/profile",
    active: isActive("/profile")
  }];
  return <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-background overflow-hidden">
        {showHeader && <Header />}
        
        <div className="flex flex-row w-full flex-1">
          {/* Left Sidebar for Desktop Navigation */}
          
          
          {/* Left ad space (smaller on desktop due to sidebar) */}
          
          
          {/* Main content */}
          <div className="flex-grow flex flex-col overflow-hidden pb-16 md:pb-0">
            {children}
          </div>
          
          {/* Right sidebar space (for ads) */}
          
        </div>
        
        {/* Bottom navigation for mobile only */}
        <BottomNavigation />
      </div>
    </SidebarProvider>;
};
export default PageLayout;