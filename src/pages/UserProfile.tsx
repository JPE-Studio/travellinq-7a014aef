
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, MapPin, CalendarDays, Link2, Loader2, Mail, Clock, Users, Bell } from 'lucide-react';
import { fetchUserProfile } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { getOrCreateConversation } from '@/services/participantService';
import { connectWithBuddy, disconnectBuddy, getBuddyConnection, updateBuddyNotificationSettings } from '@/services/chatService';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileData {
  id: string;
  pseudonym: string;
  avatar?: string;
  location: string | null;
  bio: string | null;
  website?: string | null;
  birthdate?: string | null;
  joinedAt?: Date;
  preferredLanguage?: string;
  latitude?: number;
  longitude?: number;
}

interface BuddyConnection {
  id: string;
  user_id: string;
  buddy_id: string;
  notify_at_100km: boolean;
  notify_at_50km: boolean;
  notify_at_20km: boolean;
  created_at: string;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [buddyConnection, setBuddyConnection] = useState<BuddyConnection | null>(null);
  const [approximateDistance, setApproximateDistance] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No user ID provided.",
      });
      setLoading(false);
      return;
    }

    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const profileData = await fetchUserProfile(userId);
        
        setUserData({
          id: profileData.id,
          pseudonym: profileData.pseudonym,
          avatar: profileData.avatar || '',
          location: profileData.location || null,
          bio: profileData.bio || null,
          website: profileData.website || null,
          birthdate: null,
          joinedAt: profileData.joinedAt,
          preferredLanguage: profileData.preferredLanguage,
          latitude: profileData.latitude,
          longitude: profileData.longitude
        });

        // Check if already connected as buddies
        if (user) {
          const connection = await getBuddyConnection(userId);
          setBuddyConnection(connection);
        }

        // Calculate approximate distance if user location is available
        if (user && user.latitude && user.longitude && 
            profileData.latitude && profileData.longitude) {
          const distance = calculateDistance(
            user.latitude, 
            user.longitude, 
            profileData.latitude, 
            profileData.longitude
          );
          setApproximateDistance(distance);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load user profile. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, toast, user]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return Math.round(distance);
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  const handleMessageUser = async () => {
    if (!userData) return;
    
    try {
      setMessagingLoading(true);
      const conversationId = await getOrCreateConversation(userData.id);
      console.log("Conversation created/found:", conversationId);
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create conversation. Please try again.",
      });
    } finally {
      setMessagingLoading(false);
    }
  };

  const handleConnectWithBuddy = async () => {
    if (!userData || !user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You need to be logged in to connect with buddies.",
      });
      return;
    }
    
    try {
      setConnectLoading(true);
      const connection = await connectWithBuddy(userData.id);
      setBuddyConnection(connection);
      toast({
        title: "Connected!",
        description: `You are now connected with ${userData.pseudonym} as buddies.`,
      });
    } catch (error) {
      console.error('Error connecting with buddy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect. Please try again.",
      });
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnectBuddy = async () => {
    if (!userData) return;
    
    try {
      setConnectLoading(true);
      await disconnectBuddy(userData.id);
      setBuddyConnection(null);
      toast({
        title: "Disconnected",
        description: `You are no longer connected with ${userData.pseudonym} as buddies.`,
      });
    } catch (error) {
      console.error('Error disconnecting buddy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disconnect. Please try again.",
      });
    } finally {
      setConnectLoading(false);
    }
  };

  const handleNotificationToggle = async (distance: 100 | 50 | 20, checked: boolean) => {
    if (!userData || !buddyConnection) return;
    
    try {
      let settings = {};
      
      if (distance === 100) {
        settings = { notify_at_100km: checked };
      } else if (distance === 50) {
        settings = { notify_at_50km: checked };
      } else if (distance === 20) {
        settings = { notify_at_20km: checked };
      }
      
      const updatedConnection = await updateBuddyNotificationSettings(userData.id, settings);
      setBuddyConnection(updatedConnection);
      
      toast({
        title: checked ? "Notification enabled" : "Notification disabled",
        description: `You will ${checked ? 'now' : 'no longer'} be notified when ${userData.pseudonym} is within ${distance}km.`,
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
      });
    }
  };

  if (loading) {
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
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">Could not load user profile.</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0">
      <Header />
      <div className="flex-grow flex flex-col">
        <div className="max-w-md mx-auto px-4 py-4 w-full">
          <Card className="shadow-sm bg-white">
            <CardHeader className="pb-3 pt-6 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 border border-primary/10">
                    <AvatarImage src={userData.avatar} alt={userData.pseudonym} className="object-cover" />
                    <AvatarFallback className="bg-primary/5">
                      <User className="h-5 w-5 text-primary/70" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-base font-medium">{userData.pseudonym}</h1>
                    {userData.location && (
                      <div className="flex items-center text-muted-foreground text-xs mt-0.5">
                        <MapPin className="h-3 w-3 mr-1 text-primary/50" />
                        {userData.location}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleMessageUser} 
                    disabled={messagingLoading}
                    size="sm"
                    className="text-xs"
                  >
                    {messagingLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Mail className="h-3 w-3 mr-1" />
                    )}
                    Message
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {/* Distance information */}
            {approximateDistance !== null && (
              <div className="px-6 py-2 bg-muted/20">
                <p className="text-xs text-muted-foreground flex items-center justify-center">
                  <MapPin className="h-3 w-3 mr-1 text-primary/50" />
                  Approximate distance: <span className="font-medium ml-1">{approximateDistance} km</span>
                </p>
              </div>
            )}
            
            <Separator />
            
            {/* Buddy Connection Controls */}
            {user && user.id !== userData.id && (
              <>
                <div className="px-6 py-3 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-primary/70" />
                      <span className="text-sm font-medium">Buddy Connection</span>
                    </div>
                    {buddyConnection ? (
                      <Button 
                        onClick={handleDisconnectBuddy} 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-7"
                        disabled={connectLoading}
                      >
                        {connectLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          "Disconnect"
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleConnectWithBuddy}
                        size="sm"
                        className="text-xs h-7"
                        disabled={connectLoading}
                      >
                        {connectLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <>
                            <Users className="h-3 w-3 mr-1" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {buddyConnection && (
                  <div className="px-6 py-3 bg-muted/5">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center">
                      <Bell className="h-3 w-3 mr-1" />
                      Proximity notifications
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-100km" className="text-xs cursor-pointer">
                          Notify at 100km
                        </Label>
                        <Switch 
                          id="notify-100km"
                          checked={buddyConnection.notify_at_100km}
                          onCheckedChange={(checked) => handleNotificationToggle(100, checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-50km" className="text-xs cursor-pointer">
                          Notify at 50km
                        </Label>
                        <Switch 
                          id="notify-50km"
                          checked={buddyConnection.notify_at_50km}
                          onCheckedChange={(checked) => handleNotificationToggle(50, checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-20km" className="text-xs cursor-pointer">
                          Notify at 20km
                        </Label>
                        <Switch 
                          id="notify-20km"
                          checked={buddyConnection.notify_at_20km}
                          onCheckedChange={(checked) => handleNotificationToggle(20, checked)}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <Separator />
              </>
            )}
            
            <CardContent className="px-6 py-4">
              {userData.preferredLanguage && (
                <div className="mb-4">
                  <Badge variant="outline" className="bg-primary/5 hover:bg-primary/5 text-xs font-normal">
                    {userData.preferredLanguage === 'en' ? 'English' : userData.preferredLanguage}
                  </Badge>
                </div>
              )}
              
              {userData.bio && (
                <div className="mb-4">
                  <h2 className="text-sm font-medium mb-2 text-foreground/80">About</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">{userData.bio}</p>
                </div>
              )}
              
              <div className="space-y-2.5">
                {userData.website && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Link2 className="h-3 w-3 mr-2 text-primary/50" />
                    <a 
                      href={userData.website.startsWith('http') ? userData.website : `https://${userData.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {userData.website}
                    </a>
                  </div>
                )}
                
                {userData.joinedAt && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-2 text-primary/50" />
                    Joined {userData.joinedAt.toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default UserProfile;
