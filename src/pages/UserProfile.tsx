
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, MapPin, CalendarDays, Link2, Loader2 } from 'lucide-react';
import { fetchUserProfile } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { getOrCreateConversation } from '@/services/participantService';

interface UserProfileData {
  id: string;
  pseudonym: string;
  avatar?: string;
  location: string | null;
  bio: string | null;
  website?: string | null;
  birthdate?: string | null;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
          website: null,
          birthdate: null
        });
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
  }, [userId, toast]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
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
          <p className="text-muted-foreground">Could not load user profile.</p>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0">
      <Header />
      <div className="flex-grow flex flex-col">
        <div className="max-w-3xl mx-auto px-4 py-6 w-full">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <Avatar className="h-14 w-14 mr-3">
                <AvatarImage src={userData?.avatar} alt={userData?.pseudonym} className="object-cover" />
                <AvatarFallback>
                  <User className="h-6 w-6 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-medium">{userData?.pseudonym}</h1>
                {userData?.location && (
                  <div className="flex items-center text-muted-foreground text-sm mt-0.5">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {userData.location}
                  </div>
                )}
              </div>
            </div>
            <Button 
              onClick={handleMessageUser} 
              disabled={messagingLoading}
              size="sm"
              className="text-sm"
            >
              {messagingLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              Message
            </Button>
          </div>

          <div className="space-y-4">
            {userData?.bio && (
              <div>
                <h2 className="text-base font-medium mb-1.5">About</h2>
                <p className="text-sm text-muted-foreground">{userData.bio}</p>
              </div>
            )}

            {userData?.birthdate && (
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                Born on {new Date(userData.birthdate).toLocaleDateString()}
              </div>
            )}

            {userData?.website && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Link2 className="h-3.5 w-3.5 mr-1.5" />
                <a href={userData.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {userData.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default UserProfile;
