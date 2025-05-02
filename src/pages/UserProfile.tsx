import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, User, MessageCircle, QrCode } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import BottomNavigation from '@/components/BottomNavigation';
import { fetchUserProfile } from '@/services/userService';
import { getOrCreateConversation } from '@/services/chatService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import QRCode from 'react-qr-code';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [isConnected, setIsConnected] = useState(false);
  const [isLocationShared, setIsLocationShared] = useState(true); // For demo purpose
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!userId) return;
    
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await fetchUserProfile(userId);
        setUserProfile(profile);
        
        // Check if users are connected (this would be a real check in a production app)
        // For demo, we'll randomly determine if they're connected
        setIsConnected(Math.random() > 0.5);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Failed to load user profile');
        toast({
          variant: "destructive",
          title: "Error",
          description: "We couldn't load this user's profile.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [userId, toast]);
  
  // Mock user distance - in a real app this would be calculated based on user's location
  const distance = Math.floor(Math.random() * 50) + 1;
  
  const handleConnect = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setIsConnected(!isConnected);
    toast({
      title: isConnected ? "Connection removed" : "Connection request sent",
      description: isConnected 
        ? `You are no longer connected with ${userProfile?.pseudonym}.`
        : `You've sent a connection request to ${userProfile?.pseudonym}.`,
    });
  };
  
  const handleMessage = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (userProfile && userId) {
      try {
        const conversationId = await getOrCreateConversation(userId);
        navigate(`/chat/${conversationId}`);
      } catch (err) {
        console.error('Error creating conversation:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "We couldn't start a conversation with this user.",
        });
      }
    }
  };

  const toggleNotification = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    toast({
      title: "Proximity Alert Set",
      description: `You'll be notified when ${userProfile?.pseudonym} is nearby.`,
    });
  };

  // Generate QR code data
  const qrCodeValue = userProfile ? `travellinq://user/${userProfile.id}` : '';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-4 w-full">
          <div className="flex flex-col items-center space-y-4 mb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex justify-center gap-4 mb-8">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
            <p className="text-muted-foreground mb-4">{error || "This user profile could not be loaded."}</p>
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
                <AvatarImage src={userProfile.avatar} alt={userProfile.pseudonym} className="object-cover" />
                <AvatarFallback>
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">{userProfile.pseudonym}</h1>
              {userProfile.bio && <p className="text-muted-foreground text-center">{userProfile.bio}</p>}
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
                Joined {userProfile.joinedAt.toLocaleDateString()}
              </p>
              
              {/* QR Code Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Show QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Connect with {userProfile.pseudonym}</DialogTitle>
                    <DialogDescription>
                      Scan this QR code to connect directly with {userProfile.pseudonym}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center justify-center py-6">
                    <div className="p-2 bg-white rounded-lg">
                      <QRCode value={qrCodeValue} size={200} />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
              <h2 className="text-xl font-semibold mb-4">Posts by {userProfile.pseudonym}</h2>
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
