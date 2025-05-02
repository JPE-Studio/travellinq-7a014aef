
import React, { useState } from 'react';
import ProfileButton from './ProfileButton';
import { currentUser } from '../data/mockData';
import { MapPin, Menu, X, MessageCircle, Home, Map as MapIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="sticky top-0 z-10 bg-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo and Location */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-foreground flex items-center space-x-2">
              <span className="hidden sm:inline">Travellinq</span>
              <span className="inline sm:hidden">TL</span>
            </Link>
            <div className="ml-3 bg-primary-foreground/10 px-2 py-1 rounded-full flex items-center text-sm">
              <MapPin size={14} className="mr-1 text-primary-foreground/90" />
              <span className="truncate max-w-[100px] sm:max-w-[150px] text-primary-foreground/90">Portland, OR</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 mx-4">
            <Link 
              to="/" 
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors 
                ${isActive('/') 
                  ? 'bg-primary-foreground/20 text-primary-foreground font-medium' 
                  : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'}`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link 
              to="/map" 
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors 
                ${isActive('/map') 
                  ? 'bg-primary-foreground/20 text-primary-foreground font-medium' 
                  : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'}`}
            >
              <MapIcon size={18} />
              <span>Map</span>
            </Link>
            <Link 
              to="/chats" 
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors 
                ${isActive('/chats') 
                  ? 'bg-primary-foreground/20 text-primary-foreground font-medium' 
                  : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'}`}
            >
              <MessageCircle size={18} />
              <span>Messages</span>
            </Link>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center gap-3">
            <button 
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                ${isActive('/map') 
                  ? 'bg-primary-foreground text-primary' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
              onClick={() => navigate('/map')}
            >
              <MapPin size={18} />
            </button>
            <ProfileButton user={currentUser} />
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden flex items-center justify-center w-9 h-9 bg-primary-foreground/10 rounded-full text-primary-foreground/90 hover:bg-primary-foreground/20 transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-primary border-t border-primary-foreground/10 py-2 pb-3 animate-fade-in">
            <nav className="flex flex-col space-y-1 px-2">
              <Link 
                to="/" 
                className={`flex items-center space-x-3 px-3 py-2 rounded-md ${isActive('/') ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary-foreground/80'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={20} />
                <span>Home</span>
              </Link>
              <Link 
                to="/map" 
                className={`flex items-center space-x-3 px-3 py-2 rounded-md ${isActive('/map') ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary-foreground/80'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <MapIcon size={20} />
                <span>Map</span>
              </Link>
              <Link 
                to="/chats" 
                className={`flex items-center space-x-3 px-3 py-2 rounded-md ${isActive('/chats') ? 'bg-primary-foreground/20 text-primary-foreground' : 'text-primary-foreground/80'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageCircle size={20} />
                <span>Messages</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
