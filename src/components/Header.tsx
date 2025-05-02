
import React from 'react';
import ProfileButton from './ProfileButton';
import { currentUser } from '../data/mockData';
import { MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">Travellinq</Link>
          <div className="flex items-center ml-3 text-sm bg-primary-foreground/10 px-2 py-1 rounded-full">
            <MapPin size={14} className="mr-1" />
            <span className="truncate max-w-[120px]">Portland, OR</span>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-6 mx-4">
          <Link to="/" className="hover:text-primary-foreground/80">Home</Link>
          <Link to="/map" className="hover:text-primary-foreground/80">Map</Link>
          <Link to="/chats" className="hover:text-primary-foreground/80">Messages</Link>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="bg-secondary text-secondary-foreground rounded-full p-1 w-8 h-8 flex items-center justify-center"
            onClick={() => navigate('/map')}
          >
            <MapPin size={18} />
          </button>
          <ProfileButton user={currentUser} />
        </div>
      </div>
    </header>
  );
};

export default Header;
