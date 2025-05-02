
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { getOrCreateConversation } from '@/services/participantService';
import { connectWithBuddy, disconnectBuddy, updateBuddyNotificationSettings } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import ProfileHeader from '@/components/profile/ProfileHeader';
import BuddyConnectionSection from '@/components/profile/BuddyConnectionSection';
import ProfileDetails from '@/components/profile/ProfileDetails';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    userData,
    loading,
    buddyConnection,
    approximateDistance,
    setBuddyConnection
  } = useProfileData(userId, user);

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

  const isCurrentUser = user && user.id === userData.id;

  return (
    <div className="min-h-screen flex flex-col w-full bg-background pb-16 md:pb-0">
      <Header />
      <div className="flex-grow flex flex-col">
        <div className="max-w-md mx-auto px-4 py-4 w-full">
          <Card className="shadow-sm bg-white">
            <CardHeader className="pb-3 pt-6 px-6">
              <ProfileHeader
                userData={userData}
                approximateDistance={approximateDistance}
                messagingLoading={messagingLoading}
                handleMessageUser={handleMessageUser}
              />
            </CardHeader>
            
            <Separator />
            
            {/* Buddy Connection Controls */}
            {user && (
              <>
                <BuddyConnectionSection 
                  userId={userId || ''}
                  isCurrentUser={isCurrentUser}
                  userData={userData}
                  buddyConnection={buddyConnection}
                  connectLoading={connectLoading}
                  handleConnectWithBuddy={handleConnectWithBuddy}
                  handleDisconnectBuddy={handleDisconnectBuddy}
                  handleNotificationToggle={handleNotificationToggle}
                />
                <Separator />
              </>
            )}
            
            <CardContent className="px-6 py-4">
              <ProfileDetails userData={userData} />
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default UserProfile;
