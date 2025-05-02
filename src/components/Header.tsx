
import React from 'react';
import ProfileButton from './ProfileButton';
import { currentUser } from '../data/mockData';
import { MapPin } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Travellinq</h1>
          <div className="flex items-center ml-3 text-sm bg-primary-foreground/10 px-2 py-1 rounded-full">
            <MapPin size={14} className="mr-1" />
            <span className="truncate max-w-[120px]">Portland, OR</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="bg-secondary text-secondary-foreground rounded-full p-1 w-8 h-8 flex items-center justify-center"
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
