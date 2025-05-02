
import React from 'react';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const UserProfileLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="mt-2 text-xs text-muted-foreground">Loading profile...</p>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default UserProfileLoading;
