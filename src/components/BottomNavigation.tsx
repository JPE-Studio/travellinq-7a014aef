
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, MessageCircle, User } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around py-2 md:hidden">
      <Link to="/" className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
        <Home size={20} />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link to="/map" className={`flex flex-col items-center p-2 ${isActive('/map') ? 'text-primary' : 'text-muted-foreground'}`}>
        <MapPin size={20} />
        <span className="text-xs mt-1">Map</span>
      </Link>
      
      <Link to="/chats" className={`flex flex-col items-center p-2 ${isActive('/chats') ? 'text-primary' : 'text-muted-foreground'}`}>
        <MessageCircle size={20} />
        <span className="text-xs mt-1">Chats</span>
      </Link>
      
      <Link to="/profile" className={`flex flex-col items-center p-2 ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
        <User size={20} />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </div>
  );
};

export default BottomNavigation;
