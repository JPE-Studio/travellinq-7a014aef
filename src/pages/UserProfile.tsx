
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, MapPin, CalendarDays, Link2, Loader2, Mail, Clock, Settings } from 'lucide-react';
import { fetchUserProfile } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { getOrCreateConversation } from '@/services/participantService';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
          website: profileData.website || null,
          birthdate: null,
          joinedAt: profileData.joinedAt,
          preferredLanguage: profileData.preferredLanguage
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
        <div className="max-w-md mx-auto px-4 py-4 w-full">
          <Card className="shadow-sm bg-white">
            <CardHeader className="pb-3 pt-6 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-14 w-14 border border-primary/10">
                    <AvatarImage src={userData.avatar} alt={userData.pseudonym} className="object-cover" />
                    <AvatarFallback className="bg-primary/5">
                      <User className="h-6 w-6 text-primary/70" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-lg font-medium">{userData.pseudonym}</h1>
                    {userData.location && (
                      <div className="flex items-center text-muted-foreground text-xs mt-0.5">
                        <MapPin className="h-3 w-3 mr-1 text-primary/50" />
                        {userData.location}
                      </div>
                    )}
                  </div>
                </div>
                <div>
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
            
            <Separator />
            
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
