
import React from 'react';
import Header from '@/components/Header';
import { currentUser } from '@/data/mockData';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Settings, User } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0 overflow-hidden">
      {/* Full width header */}
      <Header />
      
      {/* Content area with ad spaces */}
      <div className="flex flex-row w-full">
        {/* Left sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
        
        {/* Main content */}
        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Page specific content here */}
          <div className="max-w-3xl mx-auto px-4 py-4 w-full scrollbar-hide pb-safe">
            <div className="flex flex-col items-center space-y-4 mb-8">
              <Avatar className="h-24 w-24">
                <AvatarImage src={currentUser.avatar} alt={currentUser.pseudonym} className="object-cover" />
                <AvatarFallback>
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">{currentUser.pseudonym}</h1>
              {currentUser.bio && <p className="text-muted-foreground text-center">{currentUser.bio}</p>}
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin size={16} className="mr-1" />
                <span>Portland, OR</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Joined {currentUser.joinedAt.toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex justify-center mb-8">
              <a href="/settings" className="flex items-center text-sm bg-primary text-primary-foreground px-4 py-2 rounded-full">
                <Settings size={16} className="mr-2" />
                Edit Profile
              </a>
            </div>
            
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold mb-4">My Posts</h2>
              <div className="text-center text-muted-foreground py-8">
                You haven't created any posts yet.
              </div>
            </div>
          </div>
        </div>
        
        {/* Right sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
