
import React from 'react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const UserProfileError: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center">
        <p className="text-xs text-muted-foreground">Could not load user profile.</p>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default UserProfileError;
