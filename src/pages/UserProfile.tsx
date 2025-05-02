
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, User, MessageCircle } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { mockUsers } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import BottomNavigation from '@/components/BottomNavigation';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [isConnected, setIsConnected] = useState(false);
  const [isLocationShared, setIsLocationShared] = useState(true); // For demo purpose, default to true
  
  // Find the user from mock data
  const user = mockUsers.find(user => user.id === userId);
  
  // Mock user distance - in a real app this would be calculated based on user's location
  const distance = Math.floor(Math.random() * 50) + 1; // Random distance between 1-50 miles
  
  const handleConnect = () => {
    setIsConnected(!isConnected);
    toast({
      title: isConnected ? "Connection removed" : "Connection request sent",
      description: isConnected 
        ? `You are no longer connected with ${user?.pseudonym}.`
        : `You've sent a connection request to ${user?.pseudonym}.`,
    });
  };
  
  const handleMessage = () => {
    toast({
      title: "Starting conversation",
      description: `Opening chat with ${user?.pseudonym}.`,
    });
    // In a real app, we would navigate to the chat page
  };

  const toggleNotification = () => {
    toast({
      title: "Proximity Alert Set",
      description: `You'll be notified when ${user?.pseudonym} is nearby.`,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
            <Link to="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Full width header */}
      <Header />
      
      {/* Content area with ad spaces */}
      <div className="flex flex-row w-full">
        {/* Left sidebar space (for ads) */}
        <div className="hidden lg:block lg:w-1/6 bg-muted/10">
          {/* Ad space */}
        </div>
        
        {/* Main content */}
        <div className="flex-grow flex flex-col">
          {/* Page specific content here */}
          <div className="max-w-3xl mx-auto px-4 py-4 w-full">
            <div className="flex flex-col items-center space-y-4 mb-8">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.pseudonym} className="object-cover" />
                <AvatarFallback>
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">{user.pseudonym}</h1>
              {user.bio && <p className="text-muted-foreground text-center">{user.bio}</p>}
              <div className="flex flex-col items-center text-sm text-muted-foreground space-y-1">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  <span>Portland, OR</span>
                </div>
                
                {/* Show approximate distance if location is shared */}
                {isLocationShared && (
                  <span className="text-sm bg-muted px-2 py-0.5 rounded-full">
                    Approximately {distance} miles away
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Joined {user.joinedAt.toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex justify-center gap-4 mb-8">
              <Button 
                variant={isConnected ? "outline" : "default"}
                className="flex items-center gap-2"
                onClick={handleConnect}
              >
                {isConnected ? "Connected" : "Connect"}
              </Button>
              
              <Button 
                variant="secondary"
                className="flex items-center gap-2"
                onClick={handleMessage}
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>

              {isConnected && (
                <Button
                  variant="outline"
                  onClick={toggleNotification}
                >
                  Set Proximity Alert
                </Button>
              )}
            </div>
            
            <div className="border-t pt-8">
              <h2 className="text-xl font-semibold mb-4">Posts by {user.pseudonym}</h2>
              <div className="text-center text-muted-foreground py-8">
                No posts yet.
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

export default UserProfile;
