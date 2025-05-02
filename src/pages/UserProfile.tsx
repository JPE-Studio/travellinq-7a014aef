
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { updateBuddyNotificationSettings } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import ProfileHeader from '@/components/profile/ProfileHeader';
import BuddyConnectionSection from '@/components/profile/BuddyConnectionSection';
import ProfileDetails from '@/components/profile/ProfileDetails';
import UserActionsSection from '@/components/profile/UserActionsSection';
import NotificationSettings from '@/components/profile/NotificationSettings';
import UserProfileLoading from '@/components/profile/UserProfileLoading';
import UserProfileError from '@/components/profile/UserProfileError';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Convert auth user to app user if available
  const currentUser = user ? {
    id: user.id,
    pseudonym: user.email?.split('@')[0] || 'User',
    joinedAt: new Date(),
    // Add other properties that might be available from your auth context
    // These are placeholders as we don't have access to all user fields here
  } : null;
  
  const {
    userData,
    loading,
    buddyConnection,
    approximateDistance,
    setBuddyConnection
  } = useProfileData(userId, currentUser);

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
    return <UserProfileLoading />;
  }

  if (!userData) {
    return <UserProfileError />;
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
                messagingLoading={false}
                handleMessageUser={() => {}}
              />
            </CardHeader>
            
            <Separator />
            
            {/* User Actions */}
            <CardContent className="px-6 py-3">
              {user && !isCurrentUser && (
                <UserActionsSection 
                  userId={userId || ''}
                  isCurrentUser={isCurrentUser}
                  userData={userData}
                  buddyConnection={buddyConnection}
                  setBuddyConnection={setBuddyConnection}
                />
              )}
              
              {user && buddyConnection && (
                <NotificationSettings
                  buddyConnection={buddyConnection}
                  onToggleNotification={handleNotificationToggle}
                />
              )}
            </CardContent>
            
            <Separator />
            
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
