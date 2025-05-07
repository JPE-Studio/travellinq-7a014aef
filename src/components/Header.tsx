
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProfileButton from './ProfileButton';
import { MapPin, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationCenter from './notifications/NotificationCenter';

const Header: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b shadow-sm">
      <div className="container flex justify-between items-center h-14 px-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-full bg-primary w-9 h-9 text-primary-foreground">
            <MapPin size={20} />
          </div>
          <span className="font-semibold text-lg hidden sm:block">Travellinq</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <NotificationCenter />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {user ? (
            <ProfileButton />
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              asChild
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
