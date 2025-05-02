
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, MapPin, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
  userData: {
    pseudonym: string;
    avatar?: string;
    location: string | null;
  };
  approximateDistance: number | null;
  messagingLoading: boolean;
  handleMessageUser: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userData,
  approximateDistance,
  messagingLoading,
  handleMessageUser
}) => {
  return (
    <>
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
      
      {/* Distance information */}
      {approximateDistance !== null && (
        <div className="px-6 py-2 bg-muted/20 mt-4 -mx-6">
          <p className="text-xs text-muted-foreground flex items-center justify-center">
            <MapPin className="h-3 w-3 mr-1 text-primary/50" />
            Approximate distance: <span className="font-medium ml-1">{approximateDistance} km</span>
          </p>
        </div>
      )}
    </>
  );
};

export default ProfileHeader;
