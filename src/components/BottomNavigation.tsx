
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Search, MessageCircle, Settings } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around py-3 md:hidden z-50">
      <Link to="/map" className={`flex flex-col items-center ${isActive('/map') ? 'text-primary' : 'text-muted-foreground'}`}>
        <MapPin size={24} />
        <span className="text-xs mt-1">Umgebung</span>
      </Link>
      
      <Link to="/search" className={`flex flex-col items-center ${isActive('/search') ? 'text-primary' : 'text-muted-foreground'}`}>
        <Search size={24} />
        <span className="text-xs mt-1">Suche</span>
      </Link>
      
      <Link to="/chats" className={`flex flex-col items-center ${isActive('/chats') ? 'text-primary' : 'text-muted-foreground'}`}>
        <MessageCircle size={24} />
        <span className="text-xs mt-1">Nachrichten</span>
      </Link>
      
      <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
        <Settings size={24} />
        <span className="text-xs mt-1">Mehr</span>
      </Link>
    </div>
  );
};

export default BottomNavigation;
