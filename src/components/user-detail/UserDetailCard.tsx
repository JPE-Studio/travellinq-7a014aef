
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BuddyConnection } from '@/types';
import UserProfileHeader from './UserProfileHeader';
import UserProfileDetails from './UserProfileDetails';
import UserConnectionActions from './UserConnectionActions';
import UserNotificationSettings from './UserNotificationSettings';

interface UserData {
  id: string;
  pseudonym: string;
  avatar?: string;
  bannerImage?: string;
  location: string | null;
  bio: string | null;
  website?: string | null;
  joinedAt?: Date;
  preferredLanguage?: string;
  latitude?: number;
  longitude?: number;
}

interface UserDetailCardProps {
  userData: UserData;
  userId: string;
  buddyConnection: BuddyConnection | null;
  approximateDistance: number | null;
  setBuddyConnection: (connection: BuddyConnection | null) => void;
}

const UserDetailCard: React.FC<UserDetailCardProps> = ({
  userData,
  userId,
  buddyConnection,
  approximateDistance,
  setBuddyConnection
}) => {
  return (
    <Card className="overflow-hidden">
      <UserProfileHeader userData={userData} />

      <CardContent className="space-y-6">
        <UserProfileDetails 
          userData={userData}
          approximateDistance={approximateDistance}
        />

        <Separator />

        <div className="pt-2 space-y-4">
          <UserConnectionActions
            userId={userId}
            userData={userData}
            buddyConnection={buddyConnection}
            setBuddyConnection={setBuddyConnection}
          />

          {/* Proximity notification settings - only shown when connected */}
          {buddyConnection && (
            <UserNotificationSettings 
              buddyId={userId}
              buddyConnection={buddyConnection}
              setBuddyConnection={setBuddyConnection}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDetailCard;
