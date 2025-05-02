
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, MapPin, MessageSquare, User } from 'lucide-react';
import UnreadChatBadge from './chat/UnreadChatBadge';

const BottomNavigation = () => {
  const location = useLocation();
  
  // Determine if on main or secondary pages
  const onHomePage = location.pathname === "/" || location.pathname === "/home";
  const onMapPage = location.pathname === "/map";
  const onChatsPage = location.pathname === "/chats" || location.pathname.startsWith("/chat/");
  const onProfilePage = location.pathname === "/profile";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-background border-t">
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-around">
        <NavLink
          to="/"
          className={`flex flex-col items-center ${onHomePage ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </NavLink>
        
        <NavLink
          to="/map"
          className={`flex flex-col items-center ${onMapPage ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <MapPin className="h-5 w-5" />
          <span className="text-xs mt-1">Map</span>
        </NavLink>
        
        <NavLink
          to="/chats"
          className={`flex flex-col items-center ${onChatsPage ? 'text-primary' : 'text-muted-foreground'} relative`}
        >
          <MessageSquare className="h-5 w-5" />
          <UnreadChatBadge />
          <span className="text-xs mt-1">Chats</span>
        </NavLink>
        
        <NavLink
          to="/profile"
          className={`flex flex-col items-center ${onProfilePage ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNavigation;
